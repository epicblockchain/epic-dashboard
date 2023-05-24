const {parentPort} = require('worker_threads');
const http = require('http');

let gtimeout = 200;
const results = [];

function checkGet(ip) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: ip,
            port: 4028,
            path: '/summary',
            method: 'GET',
            timeout: gtimeout + 300,
        };
        const req = http.get(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({ip: ip, name: JSON.parse(body).Hostname});
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on('socket', (socket) => {
            socket.setTimeout(gtimeout + 800);
            socket.on('timeout', () => {
                socket.destroy();
            });
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}

async function doWork(iterator) {
    for (const item of iterator) {
        try {
            results.push(await checkGet(item));
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
    const workers = new Array(1000).fill(iterator).map(doWork);

    await Promise.allSettled(workers);

    console.log(`Portscan done. Took ${Date.now() - start}ms`);
    parentPort.postMessage(results);
});
