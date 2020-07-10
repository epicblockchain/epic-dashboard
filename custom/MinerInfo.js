const got = require('got');
var fs = require('fs');
var FormData = require('form-data');
const gzip = require('node-gzip');

class MinerInfo {
    active;
    ip;
    port;
    maxTemp;
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
        console.log('\t\tnot posting right now');
        if (arg.method == 'update') {
            console.log('reading file: '+arg.param);
            const form = new FormData();
            form.append('swupdate.swu', fs.createReadStream(arg.method));
            console.log(form);
            // got.post('http://' + this.ip + ':' + this.port + '/update', {
            //    body: form
            // });
        } else {
            console.log(arg);
            // (async () => {
            //     try{
            //         const {body} = await got.post('http://' + this.ip + ':' + this.port + '/' + arg.method, { //us-east.siamining.com:3333
            //             json: {
            //                 "param": arg.param,
            //                 "password": arg.password
            //             }
            //             // responseType: 'json' //this is only when all the sw is up to date
            //         });
            //         console.log(body);
            //     } catch (error) {
            //         console.log(error);
            //     }
            // })();
        }
    }
    
}

module.exports = {
    MinerInfo: MinerInfo
}