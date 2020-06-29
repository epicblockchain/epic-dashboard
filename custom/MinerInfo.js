const got = require('got');
const fs = require('fs');
const gzip = require('node-gzip');

class MinerInfo {
    active;
    ip;
    port;
    summaryEndpoint;
    response;
    historyEndpoint;
    history;

    constructor(ip, port){
        this.ip = ip;
        this.port = port;
        this.summaryEndpoint = "summary";
        this.historyEndpoint = "history";
    }

    fetchHistory(){
        (async () => {
            try {
                const response = await got('http://' + this.ip + ':' + this.port + '/' + this.historyEndpoint,{
                    https: {
                        rejectUnauthorized: false
                    }
                });
                this.active = true;
                this.history = JSON.parse(response.body).History;
            } catch (error) {
                console.log('Could not reach miner at http://' + this.ip + ':' + this.port+ '/' + this.historyEndpoint);
                this.active = false;
                this.history = null;
            }
        })();
    }
    
    fetchSummary(){
        (async () => {
            try {
                const response = await got('http://' + this.ip + ':' + this.port + '/' + this.summaryEndpoint,{
                    https: {
                        rejectUnauthorized: false
                    }
                });
                this.active = true;
                this.response = JSON.parse(response.body);
                // console.log(this.response); //TODO remove
            } catch (error) {
                console.log('Could not reach miner at http://' + this.ip + ':' + this.port+ '/' + this.summaryEndpoint);
                this.active = false;
                this.response = null;
            }
        })();
    }

    post(arg){
        if (arg.method === 'pool'){
            (async () => {
                try{
                    const {body} = await got.post('http://' + this.ip + ':' + this.port + '/pool', {
                        json: {
                            "pool": arg.param,
                            "password": arg.password
                        },
                        // responseType: 'json'
                    });
                    console.log(body);
                } catch (error) {
                    console.log(error);
                }
            })();
        } else if (arg.method === 'address') {
            (async () => {
                try {
                    const {body} = await got.post('http://' + this.ip + ':' + this.port + '/login', {
                        json: {
                            "login": arg.param,
                            "password": arg.password
                        },
                        // responseType: 'json'
                    });
                    console.log(body);
                } catch (error) {
                    console.log(error);
                }
            })();
        } else if (arg.method === 'mode') {
            (async () => {
                try {
                    const {body} = await got.post('http://' + this.ip + ':' + this.port + '/mode', {
                        json: {
                            "mode": arg.param,
                            "password": arg.password
                        },
                        // responseType: 'json'
                    });
                    console.log(body);
                } catch (error) {
                    console.log(error);
                }
            })();
        } else if (arg.method === 'update') {
            (async () => {
                try {
                    const {body} = await got.post('http://' + this.ip + ':' + this.port + '/mode', {
                        json: {
                            "file": "todo: put a compressed file here",
                            "password": arg.password
                        },
                        // responseType: 'json'
                    });
                    console.log(body);
                } catch (error) {
                    console.log(error);
                }
            })
        }
    }
    
}

module.exports = {
    MinerInfo: MinerInfo
}