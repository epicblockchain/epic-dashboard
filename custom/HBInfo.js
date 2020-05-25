const fs = require('fs');

class HBInfo {

    settings;
    response;
    cm; //later can be changed into json object if we want more charts

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
                x: data.Session["Last Work Timestamp"],
                y: data.Session["Average MHs"]
            });
            this.updateHTML();
        }.bind(this));

    }

    loadChart(){
        this.cm = new ChartManager('Effective??? Hashrate', 'effective-hashrate-chart');
    }

    startFetchingHBSummary(){ //if settings changed at run time the update rate needs to be updated
      
        var seconds = this.settings.requestInterval;
        this.fetchFromServer();
        // setInterval(fetchFromServer, this.settings.requestInterval); //maybe move to new function

    }

    loadSettings(){
        this.settings = JSON.parse(fs.readFileSync('settings.json'));
        if (!this.settings.production) {
            console.log("Settings loaded: \n" + JSON.stringify(this.settings));
        }
    }


    updateHTML(){
        if (!this.settings.production) console.log("updating html");
        $("#effective-hashrate").text(this.response.Session["Average MHs"] + 'MH/s'); //TODO put the actual average here and parse to the appropriate metric exponent
        $("#shares").text(this.response.Session.Accepted + '/' + this.response.Session.Rejected);
        $("#active-boards").text(this.response.Session["Active HBs"]);
        //update chart
        
    }
    
}