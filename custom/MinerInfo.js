const fs = require('fs');
const got = require('got');

class MinerInfo {
    rawResponses = [];
    alive;
    ip;
    port;
    timerID;
    requestInterval;
    apiEndpoint;

    constructor(ip, port){
        var settings = JSON.parse(fs.readFileSync('settings.json'));
        this.requestInterval = settings.requestInterval;
        this.apiEndpoint = settings.apiEndpoint;
        this.ip = ip;
        this.port = port;
    }

    fetch(){
        console.log('fetching');
        
        (async () => {
            try {
                const response = await got('http://' + this.ip + ':' + this.port + '/' + this.apiEndpoint);
                this.alive = true;
                console.log(response.body);
            } catch (error) {
                console.log('Could not reach miner at ' + this.ip + ':' + this.port);
                this.alive = false;
                this.stopPolling();
            }
        })();

    }

    startPolling(){
        this.timerID = setInterval(function(){
            this.fetch();
        }.bind(this), this.requestInterval);
    }

    stopPolling(){
        clearInterval(this.timerID);
        this.timerID = null;
    }
}

module.exports = {
    MinerInfo: MinerInfo
}