import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {after, before, test} from 'node:test';
import got from 'got';
import {createFirmwareUpload} from '../src/firmwareUpload.mjs';
import {minerRequest} from '../src/minerHttp.mjs';

let server;
let baseUrl;
let fixtureDirectory;
let firmwarePath;
let failedRequests = 0;
const firmware = Buffer.from([0, 1, 2, 127, 128, 254, 255]);

before(async () => {
    fixtureDirectory = await mkdtemp(path.join(os.tmpdir(), 'epic-http-test-'));
    firmwarePath = path.join(fixtureDirectory, 'firmware.swu');
    await writeFile(firmwarePath, firmware);
    server = http.createServer(async (request, response) => {
        if (request.url === '/error') {
            failedRequests++;
            response.writeHead(500).end('error');
            return;
        }
        if (request.url === '/slow') {
            setTimeout(() => response.end('slow'), 200);
            return;
        }
        if (request.url === '/log') {
            response.end('miner log\n');
            return;
        }
        try {
            const chunks = [];
            for await (const chunk of request) chunks.push(chunk);
            const body = Buffer.concat(chunks);
            let result = {ok: true};
            if (request.url === '/json') result = JSON.parse(body.toString());
            if (request.url === '/upload') {
                assert.equal(Number(request.headers['content-length']), body.length);
                const form = await new Response(body, {headers: request.headers}).formData();
                const file = form.get('swupdate.swu') || form.get('update.zip');
                result = {
                    password: form.get('password'),
                    checksum: form.get('checksum'),
                    keep: form.get('keepsettings'),
                    field: form.has('swupdate.swu') ? 'swupdate.swu' : 'update.zip',
                    filename: file.name,
                    type: file.type,
                    file: Array.from(new Uint8Array(await file.arrayBuffer())),
                };
            }
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify(result));
        } catch (error) {
            response.writeHead(500).end(error.message);
        }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    }
    if (fixtureDirectory) await rm(fixtureDirectory, {recursive: true, force: true});
});

test('summary requests use the current timeout and retry API', async () => {
    const response = await minerRequest(`${baseUrl}/summary`, {timeout: {request: 2000}, retry: {limit: 0}});
    assert.deepEqual(JSON.parse(response.body), {ok: true});
});

test('commands preserve JSON request and response bodies', async () => {
    const command = {param: {coin: 'btc'}, password: 'test'};
    const {body} = await minerRequest(`${baseUrl}/json`, {
        method: 'POST',
        json: command,
        responseType: 'json',
        timeout: {request: 2000},
        retry: {limit: 0},
    });
    assert.deepEqual(body, command);
});

test('log requests preserve plain-text response bodies across IPC', async () => {
    assert.deepEqual(await minerRequest(`${baseUrl}/log`), {body: 'miner log\n'});
});

test('retry limit zero prevents repeating failed requests', async () => {
    await assert.rejects(minerRequest(`${baseUrl}/error`, {retry: {limit: 0}}), {name: 'HTTPError'});
    assert.equal(failedRequests, 1);
});

test('request timeouts still reject stalled requests', async () => {
    await assert.rejects(minerRequest(`${baseUrl}/slow`, {timeout: {request: 25}, retry: {limit: 0}}), {
        name: 'TimeoutError',
    });
});

for (const [api, field, type] of [
    ['/update', 'swupdate.swu', 'application/octet-stream'],
    ['/systemupdate', 'update.zip', 'application/zip'],
]) {
    test(`${api} streams firmware with the original fields and a valid Content-Length`, async () => {
        const upload = await createFirmwareUpload(api, {filepath: firmwarePath, password: 'test', keep: true});
        const {body} = await got.post(`${baseUrl}/upload`, {
            ...upload,
            responseType: 'json',
            timeout: {request: 2000},
            retry: {limit: 0},
        });
        assert.deepEqual(body, {
            password: 'test',
            checksum: createHash('sha256').update(firmware).digest('hex'),
            keep: 'true',
            field,
            filename: path.basename(firmwarePath),
            type,
            file: Array.from(firmware),
        });
    });
}

test('unsupported firmware endpoints are rejected before making a request', async () => {
    await assert.rejects(
        createFirmwareUpload('/unknown', {filepath: firmwarePath, password: 'test', keep: false}),
        /Unsupported firmware endpoint/,
    );
});
