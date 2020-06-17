const got = require('got');

class MinerInfo {
    active;
    ip;
    port;
    apiEndpoint;
    response;

    constructor(ip, port, apiEndpoint){
        this.apiEndpoint = apiEndpoint;
        this.ip = ip;
        this.port = port;
    }

    fetch(){
        
        (async () => {
            try {
                const response = await got('http://' + this.ip + ':' + this.port + '/' + this.apiEndpoint);
                this.active = true;
                this.response = JSON.parse(response.body);
                // console.log(this.response); //TODO remove
            } catch (error) {
                console.log('Could not reach miner at http://' + this.ip + ':' + this.port+ '/' + this.apiEndpoint);
                this.active = false;
                this.response = null;
            }
        })();

    }

    postUpdate(poolString){
        (async () => {
            const {body} = await got.post('https://' + this.ip + ':' + '/', {
                json: {
                    "Pool": poolString
                },
                responseType: 'json'
            });
         
            console.log("post update");
            console.log(body.data);
        })();
    }

}

module.exports = {
    MinerInfo: MinerInfo
}