const got = require('got');
const fs = require('fs');

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
        (async () => {
            try {
                const {body} = await got.post('http://' + this.ip + ':' + this.port + '/' + arg.method, {
                    json: {
                        "param": arg.param,
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

module.exports = {
    MinerInfo: MinerInfo
}