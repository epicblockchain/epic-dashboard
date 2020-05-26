const fs = require('fs');

class HBInfo {

    settings;
    response;
    cm; //later can be changed into json object if we want more charts
    workers = [];
    // totalWorkerHR = [];

    constructor(){
        this.loadSettings();
        this.loadChartManager();
        this.startFetchingHBSummary();
    }

    loadChartManager(){
        this.cm = new ChartManager('total-worker-hr-chart', this.settings.requestInterval);
        // this.cm.pushData(0);
    }

    fetchFromServer(){
        if (!this.settings.production){
          console.log("Fetching from server...");
        }
        $.get(this.settings.apiEndpoint, function( data ) {
            this.response = data;
            if (this.workers.length == 0){
                this.loadWorkers();
            }
            this.updateTotalWorkerHR();
            this.updateWorkers();
            this.updateHTML();

        }.bind(this));
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
        //workers
        if (!this.settings.production) console.log("updating html");
        $("#total-worker-hr").text(this.response.Session["Average MHs"] + 'MH/s'); //TODO put the actual average here and parse to the appropriate metric exponent
        $("#shares").text('Accepted: ' + this.response.Session.Accepted + ' | Rejected: ' + this.response.Session.Rejected);
        $("#active-boards").text(this.response.Session["Active HBs"]);
        $('#uptime').text(this.response.Session["Uptime"]);

        // $("#total-worker-hr-chart").html(JSON.stringify(this.totalWorkerHR));
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

    updateTotalWorkerHR(){
        if (!this.settings.production) this.cm.pushData(this.response.Session["Average MHs"]/1000 + Math.random()*1000);
        else this.cm.pushData(this.response.Session["Average MHs"]/1000);
    }

}