const fs = require('fs');

class HBInfo {

    settings;
    response;
    cm; //later can be changed into json object if we want more charts
    workers = [];

    constructor(){
        this.loadSettings();
        this.loadChart();
        this.startFetchingHBSummary();
    }

    fetchFromServer(){
        if (!this.settings.production){
          console.log("Fetching from server...");
        }
        $.get(this.settings.apiEndpoint, function( data ) {
            this.response = data;
            this.cm.pushDatum({
                x: new Date(), //now
                y: data.Session["Average MHs"]/1000
            });
            this.updateHTML();
            if (this.workers.length == 0){
                this.loadWorkers();
            }
            this.updateWorkers();
        }.bind(this));

    }

    loadChart(){
        this.cm = new ChartManager('Hashrate (GH/s)', 'effective-hashrate-chart');
    }

    startFetchingHBSummary(){ //if settings changed at run time the update rate needs to be updated
      
        var seconds = this.settings.requestInterval;
        this.fetchFromServer();
        setInterval(function(){
            this.fetchFromServer();
        }.bind(this), this.settings.requestInterval);

    }

    loadSettings(){
        this.settings = JSON.parse(fs.readFileSync('settings.json'));
        if (!this.settings.production) {
            console.log("Settings loaded: \n" + JSON.stringify(this.settings));
        }
    }

    updateHTML(){
        if (!this.settings.production) console.log("updating html");
        $("#effective-hashrate").text(this.response.Session["Average MHs"]/1000 + 'GH/s'); //TODO put the actual average here and parse to the appropriate metric exponent
        $("#shares").text('Accepted: ' + this.response.Session.Accepted + '| Rejected: ' + this.response.Session.Rejected);
        $("#active-boards").text(this.response.Session["Active HBs"]);
    }

    loadWorkers(){
        this.response.HBs.forEach(function(hb){
            this.workers.push(new Worker(hb.Index));
        }.bind(this));
    }
    
    updateWorkers(){
        this.workers.forEach(function(worker){
            worker.update(this.response.HBs[worker.index]);
        }.bind(this));

        this.workers.forEach(function(worker){
            worker.display();
        });

    }

}