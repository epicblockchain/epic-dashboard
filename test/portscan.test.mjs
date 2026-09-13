import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFile} from 'node:fs/promises';
import Module from 'node:module';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import vm from 'node:vm';
import {transformAsync, transformFromAstAsync} from '@babel/core';

const workerSource = await readFile(new URL('../src/portscan.js', import.meta.url), 'utf8');
const filename = fileURLToPath(new URL('../src/app.jsx', import.meta.url));
const {ast} = await transformAsync(await readFile(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    parserOpts: {plugins: ['jsx']},
    ast: true,
    code: false,
});
const appClass = ast.program.body.find((node) => node.type === 'ClassDeclaration' && node.id.name === 'App');
// Exercise the actual state handler without mounting the app or touching saved settings.
const {code} = await transformFromAstAsync(
    {
        ...ast,
        program: {
            ...ast.program,
            body: [
                {
                    type: 'ExportNamedDeclaration',
                    declaration: {
                        ...appClass,
                        superClass: null,
                        body: {
                            ...appClass.body,
                            body: appClass.body.body.filter((node) => node.key.name === 'setScan'),
                        },
                    },
                    specifiers: [],
                    source: null,
                },
            ],
        },
    },
    undefined,
    {
        filename,
        babelrc: false,
        configFile: false,
        targets: {node: '22'},
        presets: [['@babel/preset-env', {modules: 'commonjs'}]],
    },
);
const compiled = new Module(filename);
compiled._compile(code, filename);
const {App} = compiled.exports;

async function scan(ip, range, miners = new Map()) {
    const requests = [];
    let receive;
    let result;
    const parentPort = {
        on: (event, listener) => {
            assert.equal(event, 'message');
            receive = listener;
        },
        postMessage: (value) => {
            result = value;
        },
    };
    const http = {
        get: (options, callback) => {
            requests.push(options);
            const request = new EventEmitter();
            queueMicrotask(() => {
                if (!miners.has(options.hostname)) {
                    request.emit('error', new Error('Unreachable fixture host'));
                    return;
                }
                const response = new EventEmitter();
                response.setEncoding = () => {};
                callback(response);
                response.emit('data', JSON.stringify({Hostname: miners.get(options.hostname)}));
                response.emit('end');
            });
            return request;
        },
    };
    vm.runInNewContext(workerSource, {
        require: (name) => {
            if (name === 'worker_threads') return {parentPort};
            assert.equal(name, 'http');
            return http;
        },
        console: {log: () => {}},
    });
    await receive({ip, range, timeout: '500'});
    return {requests, result: JSON.parse(JSON.stringify(result))};
}

for (const prefix of ['22', 22]) {
    test(`/22 (${typeof prefix}) scans exactly the four /24 subnets in 10.34.0.0/22`, async () => {
        const miners = new Map([
            ['10.34.0.10', 'miner-0'],
            ['10.34.1.20', 'miner-1'],
            ['10.34.2.30', 'miner-2'],
            ['10.34.3.40', 'miner-3'],
            ['10.34.4.50', 'outside-range'],
        ]);
        const {requests, result} = await scan(typeof prefix === 'string' ? '10.34.0.0' : '10.34.0', prefix, miners);
        const expected = Array.from({length: 1024}, (_, index) => `10.34.${Math.floor(index / 256)}.${index % 256}`);
        assert.deepEqual(
            requests.map((request) => request.hostname),
            expected,
        );
        assert.ok(requests.every((request) => request.port === 4028 && request.path === '/summary'));
        assert.ok(requests.every((request) => request.timeout === 800));
        assert.deepEqual(
            result.sort((a, b) => a.ip.localeCompare(b.ip)),
            Array.from(miners, ([ip, name]) => ({ip, name})).slice(0, 4),
        );
    });
}

test('/22 aligns a full host address to the containing CIDR network', async () => {
    const {requests} = await scan('10.34.7.123', '22');
    assert.equal(requests.length, 1024);
    assert.equal(requests[0].hostname, '10.34.4.0');
    assert.equal(requests.at(-1).hostname, '10.34.7.255');
});

test('/22 at the last third octet does not scan beyond the /16 boundary', async () => {
    const {requests} = await scan('10.34.255', '22');
    assert.equal(requests.length, 1024);
    assert.equal(requests[0].hostname, '10.34.252.0');
    assert.equal(requests.at(-1).hostname, '10.34.255.255');
});

for (const prefix of ['16', 16, '24', 24]) {
    test(`/${prefix} (${typeof prefix}) retains its original scan coverage`, async () => {
        const {requests, result} = await scan('10.34.42.99', prefix);
        const subnets = Number(prefix) === 16 ? 256 : 1;
        const firstSubnet = Number(prefix) === 16 ? 0 : 42;
        const expected = Array.from(
            {length: subnets * 256},
            (_, index) => `10.34.${firstSubnet + Math.floor(index / 256)}.${index % 256}`,
        );
        assert.deepEqual(
            requests.map((request) => request.hostname),
            expected,
        );
        assert.deepEqual(result, []);
    });
}

test('Advanced Scan offers /16, /22 and /24 prefixes', () => {
    const prefixes = [];
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'JSXElement' && node.openingElement.name.name === 'option') {
            prefixes.push(node.children.find((child) => child.type === 'JSXText').value.trim());
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else visit(value);
        }
    }
    visit(appClass.body.body.find((node) => node.key.name === 'render'));
    assert.deepEqual(prefixes, ['16', '22', '24']);
});

test('switching from /16 to /22 or /24 restores the third octet', () => {
    for (const prefix of ['22', '24']) {
        const app = new App();
        app.state = {scanIp: '10.34', scanRange: '16'};
        app.setState = (update) => {
            Object.assign(app.state, update);
        };
        app.setScan({target: {value: prefix}}, 'scanRange');
        assert.deepEqual(app.state, {scanIp: '10.34.0', scanRange: prefix});
        app.setScan({target: {value: '10.34.4'}}, 'scanIp');
        assert.equal(app.state.scanIp, '10.34.4');
        app.setScan({target: {value: '10.34.4.0'}}, 'scanIp');
        assert.equal(app.state.scanIp, '10.34.4');
        app.setScan({target: {value: '16'}}, 'scanRange');
        assert.deepEqual(app.state, {scanIp: '10.34', scanRange: '16'});
    }
});
