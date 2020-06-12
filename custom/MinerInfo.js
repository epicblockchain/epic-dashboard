const got = require('got');

class MinerInfo {
    alive;
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
        console.log('fetching');
        
        (async () => {
            try {
                const response = await got('http://' + this.ip + ':' + this.port + '/' + this.apiEndpoint);
                this.alive = true;
                this.response = JSON.parse(response.body);
                console.log(this.response); //TODO remove
            } catch (error) {
                console.log('Could not reach miner at http://' + this.ip + ':' + this.port+ '/' + this.apiEndpoint);
                this.alive = false;
                this.response = null;
            }
        })();

    }

}

module.exports = {
    MinerInfo: MinerInfo
}