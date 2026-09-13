import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {ESLint} from 'eslint';

const root = fileURLToPath(new URL('../', import.meta.url));
const eslint = new ESLint({cwd: root});
const require = createRequire(import.meta.url);

async function lint(source, file) {
    const [result] = await eslint.lintText(source, {filePath: path.join(root, file)});
    return result.messages;
}

test('the lint command uses ESLint 10 without legacy CLI options', () => {
    assert.match(ESLint.version, /^10\./);
    const command = require('../package.json').scripts.lint;
    assert.doesNotMatch(command, /--ignore-path|--env/);
    assert.match(command, /--max-warnings 0/);
});

for (const [name, file, source] of [
    ['CommonJS webpack configuration', 'webpack.main.config.js', 'module.exports = {entry: __dirname};'],
    [
        'CommonJS worker',
        'src/portscan.js',
        "const {parentPort} = require('node:worker_threads'); parentPort.postMessage(process.pid);",
    ],
    [
        'Electron main process',
        'src/main.js',
        "import path from 'node:path'; export const entry = path.join(__dirname, MAIN_WINDOW_WEBPACK_ENTRY);",
    ],
    ['native Node ESM APIs', 'src/firmwareUpload.mjs', 'export const form = new FormData();'],
    [
        'Node-enabled JSX renderer',
        'src/app.jsx',
        "const {ipcRenderer} = require('electron'); export const View = () => <button onClick={() => ipcRenderer.send('quit')}>{window.location.hash}</button>;",
    ],
    [
        'Node test files',
        'test/fixture.test.mjs',
        "import test from 'node:test'; test('version', () => console.log(process.version));",
    ],
]) {
    test(`flat config supports ${name}`, async () => {
        assert.deepEqual(await lint(source, file), []);
    });
}

test('JSX component references count as uses without a React lint plugin', async () => {
    assert.deepEqual(
        await lint("import Card from './card.jsx'; export const View = () => <Card />;", 'src/view.jsx'),
        [],
    );
});

test('undefined JSX components are reported', async () => {
    const messages = await lint('export const View = () => <Missing />;', 'src/view.jsx');
    assert.equal(messages.length, 1);
    assert.equal(messages[0].ruleId, 'no-undef');
});

test('unused variables are still reported', async () => {
    const messages = await lint('const unused = 42;', 'src/unused.mjs');
    assert.equal(messages.length, 1);
    assert.equal(messages[0].ruleId, 'no-unused-vars');
});

test('object-rest destructuring can intentionally discard sibling fields', async () => {
    const source = 'export function copy(value) { const {secret, ...rest} = value; return rest; }';
    assert.deepEqual(await lint(source, 'src/copy.mjs'), []);
});

for (const file of ['src/main.js', 'src/minerHttp.mjs']) {
    test(`browser globals are not available in ${file}`, async () => {
        const messages = await lint('export const title = document.title;', file);
        assert.equal(messages.length, 1);
        assert.equal(messages[0].ruleId, 'no-undef');
    });
}

test('generated output and editor files are ignored', async () => {
    for (const file of [
        'node_modules/example/index.js',
        'out/example/index.js',
        '.webpack/main/index.js',
        '.vscode/settings.js',
        'nested/out/example.js',
        'nested/.webpack/example.js',
        'nested/.vscode/example.js',
        'src/example.js.swp',
    ]) {
        assert.equal(await eslint.isPathIgnored(path.join(root, file)), true, file);
    }
    assert.equal(await eslint.isPathIgnored(path.join(root, 'src/app.jsx')), false);
    assert.equal(await eslint.isPathIgnored(path.join(root, 'test/eslint-config.test.mjs')), false);
});

test('unused eslint-disable comments are errors', async () => {
    const messages = await lint('// eslint-disable-next-line no-undef\nexport const answer = 42;', 'src/answer.mjs');
    assert.equal(messages.length, 1);
    assert.match(messages[0].message, /Unused eslint-disable directive/);
    assert.equal(messages[0].severity, 2);
});
