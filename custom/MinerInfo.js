const got = require('got');

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

    post(poolJSON){
        (async () => {
            const {body} = await got.post('https://httpbin.org/anything', {
                json: {
                    hello: 'world'
                },
                responseType: 'json'
            });
         
            console.log(body.data);
            //=> '{"hello":"world"}'
        })();
    }

}

module.exports = {
    MinerInfo: MinerInfo
}