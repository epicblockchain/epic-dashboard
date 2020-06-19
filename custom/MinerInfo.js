const got = require('got');
const fs = require('fs');
const { icpMain } = require('electron');
const FormData = require('form-data');

class MinerInfo {
    active;
    ip;
    port;
    summaryEndpoint;
    response;
    changePoolEndpoint;

    constructor(ip, port, summaryEndpoint, changePoolEndpoint){
        this.summaryEndpoint = summaryEndpoint;
        this.ip = ip;
        this.port = port;
        this.changePoolEndpoint = changePoolEndpoint;
    }

    fetch(){
        
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

    postPool(poolJSON){
        (async () => {
            console.log('http://' + this.ip + ':' + this.port + '/' + this.changePoolEndpoint + '?!?!?!?!?');
            
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