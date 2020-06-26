const got = require('got');
const fs = require('fs');
const FormData = require('form-data');

class MinerInfo {
    active;
    ip;
    port;
    summaryEndpoint;
    response;
    historyEndpoint;
    history;
    changePoolEndpoint;

    constructor(ip, port, summaryEndpoint, changePoolEndpoint, historyEndpoint){
        this.summaryEndpoint = summaryEndpoint;
        this.ip = ip;
        this.port = port;
        this.changePoolEndpoint = changePoolEndpoint;
        this.historyEndpoint = historyEndpoint;
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
                this.history = JSON.parse(response.body);
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
                this.response = JSON.parse(response.body);
                // console.log(this.response); //TODO remove
            } catch (error) {
                console.log('Could not reach miner at http://' + this.ip + ':' + this.port+ '/' + this.summaryEndpoint);
                this.response = null;
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
            //=> '{"hello":"world"}'
        })().catch(function(error){
            console.log(error);
        });
    }

    postSWUpdate(filepath) {
        (async () => {
            const form = newFormData();
            form.append('swupdate.swu', fs.createReadStream(filepath));
            console.log('form:');
            console.log(form);
            got.post('http://' + this.ip + ':' + this.port + '/' + this.changePoolEndpoint, {
                body: form
            }).catch(function(error){
                console.log(error);
            });

        })
    }
    
}

module.exports = {
    MinerInfo: MinerInfo
}