const {parentPort} = require('worker_threads');
const net = require('net');
const http = require('http');

let gtimeout = 200;
const results = [];

function checkPort(ip) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.connect({port: 4028, host: ip}, () => {
            resolve(ip);
            client.destroy();
        });
        client.setTimeout(gtimeout);
        client.on('timeout', () => {
            reject(Error('timeout'));
            client.destroy();
        });
        client.on('error', (e) => {
            reject(e);
            client.destroy();
        });
    });
}

async function doWork(iterator) {
    for (const item of iterator) {
        try {
            results.push(await checkPort(item));
        } catch {}
    }
}

parentPort.on('message', async ({ip, range, timeout}) => {
    console.log(ip, range, timeout);
    gtimeout = parseInt(timeout);
    const start = Date.now();
    const split = ip.split('.');

    const ips = [];

    for (let i = 0; i < (range === '16' ? 256 : 1); i++) {
        for (let j = 0; j < 256; j++) {
            ips.push(`${split[0]}.${split[1]}.${range === '16' ? i : split[2]}.${j}`);
        }
    }

    const iterator = ips.values();
    const workers = new Array(1020).fill(iterator).map(doWork);

    await Promise.allSettled(workers);

    const finalResults = await Promise.all(
        results.map((ip) => {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: ip,
                    port: 4028,
                    path: '/summary',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: gtimeout + 300,
                };
                http.get(options, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        resolve({ip: ip, name: JSON.parse(body).Hostname});
                    });
                });
            });
        })
    );

    console.log(`Portscan done. Took ${Date.now() - start}ms`);
    parentPort.postMessage(finalResults);
});
