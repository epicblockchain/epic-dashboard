const got = require('got');
var fs = require('fs');
var FormData = require('form-data');
const gzip = require('node-gzip');
const sha256 = require('sha256-file');

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

    post(arg, win){
        console.log(this.ip);
        // console.log('\t\tnot posting right now');
        if (arg.method == 'update') {
            arg.param = JSON.parse(arg.param);
            console.log('arg is');
            console.log(arg);
            console.log('reading file: '+arg.param.filepath);
            const form = new FormData();
			form.append('password', arg.password);
			form.append('checksum', sha256(arg.param.filepath));
            form.append('keepsettings', arg.param.keepsettings.toString());
            form.append('swupdate.swu', fs.createReadStream(arg.param.filepath));
            console.log('sending...');
			console.log(form);
            const response = got.post('http://' + this.ip + ':' + this.port + '/update', {
               body: form
            });
			console.log("server sent back:");
			console.log(response.body); //todo: parse this if its a json and provide the user with some feedback if something went wrong...
        } else {
            console.log(arg);
            (async () => {
                try{
                    const {body} = await got.post('http://' + this.ip + ':' + this.port + '/' + arg.method, { //us-east.siamining.com:3333
                        json: {
                            "param": arg.param,
                            "password": arg.password
                        }
                        // responseType: 'json' //this is only when all the sw is up to date
                    });
                    var b = JSON.parse(body);
                    console.log(b);
                    if (b["result"] === false) {
                        win.webContents.send('request-alert', 'Something went wrong!!<br>'+b["error"]);
                    }
                } catch (error) {
                    console.log(error);
                }
            })();
        }
    }
    
}

module.exports = {
    MinerInfo: MinerInfo
}
