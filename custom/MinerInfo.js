const got = require('got');
const fs = require('fs');
const FormData = require('form-data');
const gzip = require('node-gzip');

class MinerInfo {
    active;
    ip;
    port;
    summaryEndpoint;
    response;
    historyEndpoint;
    history;
    changePoolEndpoint;

    constructor(ip, port){
        this.ip = ip;
        this.port = port;
        this.summaryEndpoint = "summary";
        this.changePoolEndpoint = "pool";
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
                this.response = null;
                this.active = false;
            }
        })();
    }

    postPool(poolJSON){
        (async () => {
            const {body} = await got.post(('http://' + this.ip + ':' + this.port + '/' + this.changePoolEndpoint), {
                https: {
                    rejectUnauthorized: false
                },
                json: poolJSON,
                responseType: 'json'
            });
            console.log(body.data);
        })().catch(function(error){
            console.log(error);
        });
    }

    postSWUpdate(filepath) {
        
    }
    
}

module.exports = {
    MinerInfo: MinerInfo
}