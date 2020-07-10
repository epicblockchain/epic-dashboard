const roundTo = require('round-to');

function generateDashboardData(miners){
    var totalHashrate = 0;
    var acceptedShares = 0;
    var rejectedShares = 0;
    var activeMiners = 0;
    var pool; //this cannot be an aggregate
    var totalDifficulty = 0; //this can be averaged, but do we want it to?
    var lastAcceptedShareTime = null; //this can be found but is it useful
  
    miners.forEach(miner => {
      if (miner.active) {
        totalHashrate += miner.response["Session"]["Average MHs"];
        acceptedShares += miner.response["Session"]["Accepted"];
        rejectedShares += miner.response["Session"]["Rejected"];
        pool = miner.response["Stratum"]["Current Pool"];
        activeMiners++;
        totalDifficulty += miner.response["Session"]["Difficulty"];
        if (lastAcceptedShareTime < miner.response["Session"]["Last Accepted Share Timestamp"]){
          lastAcceptedShareTime = miner.response["Session"]["Last Accepted Share Timestamp"];
        }
      }
    });
  
    var avgDifficulty = totalDifficulty / activeMiners;
  
    var totalHashrateString = MHToHRString(totalHashrate);
  
    var shareString = acceptedShares + " / " + rejectedShares;
    var activeMinerString = activeMiners.toString() + " / " + miners.length;
    var currentPoolString = pool || "Disconnected";
    var avgDifficultyString = roundTo(avgDifficulty, 0) || "N/A";
    var lastAcceptedShareString = new Date(lastAcceptedShareTime*1000).toString() || "Disconnected";
  
    if (lastAcceptedShareTime == null) lastAcceptedShareString = '    Disconnected';
  
    return {
      "total-hashrate": totalHashrateString,
      "accepted-rejected-shares": shareString,
      "active-miners": activeMinerString,
      "current-pool": currentPoolString,
      "avg-difficulty": avgDifficultyString,
      "last-accepted-share-time": lastAcceptedShareString.substr(4, 20)
    };
}
  
function MHToHRString(totalHashrate){
    if (totalHashrate === null || totalHashrate === undefined) return "0 H/s";
    if (totalHashrate < 1000) totalHashrateString = roundTo(totalHashrate,2) + " MH/s";
    else if (totalHashrate > 1000 && totalHashrate <= 1000000) totalHashrateString = roundTo(totalHashrate/1000,2) + " GH/s";
    else if (totalHashrate > 1000000 && totalHashrate <= 1000000000) totalHashrateString = roundTo(totalHashrate/1000000,2) + " TH/s";
    else if (totalHashrate > 1000000000 && totalHashrate <= 1000000000000) totalHashrateString = roundTo(totalHashrate/1000000000,2) + " PH/s";
    else totalHashrateString = roundTo(totalHashrate,2) + " MH/s";
    return totalHashrateString
}
  
function generateMinerData(miners){
    var headers = ['Name', 
      'Software', 
      // 'Coin', 
      // 'Algorithm', 
      'Pool',
      'User', 
      'Started', 
      // 'Last Work', 
      // 'Last Accepted Share',
      // 'Uptime', 
      // 'Work Received', 
      'Active HBs', 
      'Hashrate', 
      'Accepted', 
      'Rejected', 
      // 'Submitted',
      'Difficulty',
      // 'Fan Speed',
      'Temperature (&degC)',
      'IP Address'];
  
    var data = [];  

    miners.forEach(m => {
      if (m.active){
        var maxTemp = -1;
        m.response["HBs"].forEach(hb => {
          if (maxTemp < hb["Temperature"]) {
            m.maxTemp = hb["Temperature"];
            maxTemp = hb["Temperature"];
          }
        });
      }
    });
  
    miners.forEach(m => {
      if (m.active) {
        var datum = [m.response["Hostname"],
          m.response["Software"] || "N/A",
          // m.response["Mining"]["Coin"] || "N/A",
          // m.response["Mining"]["Algorithm"] || "N/A",
          m.response["Stratum"]["Current Pool"] || "N/A",
          m.response["Stratum"]["Current User"].substr(0, 8) + ' ... ' + m.response["Stratum"]["Current User"].substr(-18, 18) || "N/A",
          new Date(m.response["Session"]["Startup Timestamp"]*1000).toString().substr(4, 20) || "N/A",
          // new Date(m.response["Session"]["Last Work Timestamp"]*1000) || "N/A",
          // new Date(m.response["Session"]["Last Accepted Share Timestamp"]*1000).toString().substr(4, 20) || "N/A",
          // m.response["Session"]["Uptime"] || "N/A",
          // m.response["Session"]["WorkReceived"] || "N/A",
          m.response["Session"]["Active HBs"] || "N/A",
          MHToHRString(m.response["Session"]["Average MHs"]) || "N/A",
          m.response["Session"]["Accepted"] || "N/A",
          m.response["Session"]["Rejected"] || "N/A",
          // m.response["Session"]["Submitted"] || "N/A",
          m.response["Session"]["Difficulty"] || "N/A",
          // 'fan speed string todo',
          // m.response["Fans"]["Fans Speed"] || "N/A",
          m.maxTemp,
          m.ip];
          data.push(datum);
  
      } else {
  
        data.push(['Disconnected']);
      }
    });
  
    return {"headers": headers,
      "data": data};
}

function generateChartData(miners, data){
    var hr = 0;
    miners.forEach(m => {
      if (m.active) {
        hr += m.response["Session"]["Average MHs"]/1000000;
      }
    });
    data.push({x: Date.now(), y: hr});
    return {
      "hr-chart": data,
    };
}

function loadHistoryChartData(miners){
    var data = {};
    var chartData = [];
    
    //put the data in an easy to manipulate way
    if (miners === null || miners === undefined) return [];
    miners.forEach(m => {
        if (m.active && m.history) {
            m.history.forEach(p => {
                var t = p.Timestamp;
                if (data.hasOwnProperty(t)){
                    data[t].push(p.Hashrate);
                } else {
                    data[t] = [p.Hashrate];
                }
            });
        }
    });

    //aggregate
    //uses in place operations, maybe you can get better by using a new var to hold your stuff
    Object.keys(data).forEach(d => {
        var sum = 0;
        var count = 0;
        data[d].forEach(hr => {
            sum += hr;
            count++;
        });
        sum /= count;
        data[d] = sum;
    });

    //put in chartjs compatible format
    Object.keys(data).forEach(d => {
        chartData.push({
            x: new Date(d*1000),
            y: data[d]/1000000
        });
    });
    
    return chartData;
}

function generateSettingsMinerList(miners){
    var list = [];
    miners.forEach(m => {
        if (m.active) {
            list.push({
                "name": m.ip + ':' + m.port
            });
        }
    });
    return list;
}

module.exports = {
    generateDashboardData:generateDashboardData,
    MHToHRString: MHToHRString,
    generateMinerData: generateMinerData,
    generateChartData: generateChartData,
    loadHistoryChartData: loadHistoryChartData,
    generateSettingsMinerList: generateSettingsMinerList
}