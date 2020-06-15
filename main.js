const { app, BrowserWindow, screen } = require('electron')
// var mdns = require('multicast-dns')()
const fs = require('fs');
const dnssd = require('dnssd2');

if (!fs.existsSync('settings.json')){
  fs.writeFileSync('settings.json', fs.readFileSync('settingsDefault.json'));
}



function createWindow () {
  // Create the browser window.

  const screenArea = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: screenArea.width*0.7,
    height: screenArea.width*0.3,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  var settings = JSON.parse(fs.readFileSync('settings.json'));
  if (!settings.production) win.webContents.openDevTools();

  //hide the janky top menu for now, since I dont think it will be useful
  win.removeMenu(); //this may not work on mac
  //this section is if we want our own menu, but rn not needed
  // const template = [];
  // const menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(menu);

  startLoop(win);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var settings = JSON.parse(fs.readFileSync('settings.json'));
fs.writeFileSync('settings.json', JSON.stringify(settings));

//api access logic entry
var minerinfo = require('./custom/MinerInfo');
var miners = []; //this will also hold inactive miners

var browser = dnssd.Browser(dnssd.tcp('epicminer'))
  .on('serviceUp',function(service){
    var ip = service.addresses[0];
    var port = service.port;
    m = new minerinfo.MinerInfo(ip, port, settings.apiEndpoint);
    miners.push(m);
    if (!settings.production) console.log('found miner at: ' + ip + ':' + port);
  })
  .on('serviceDown', service => console.log("Device down: ", service))//TODO: does this have any use case?
  .start();

//returns the timerid if we want to clearInterval();
function startLoop(win){

  //this runs immediately and also after every request interval
  return setInterval(function immediate(){
    miners.forEach(m => {
      m.fetch();
    });

    //dashboard
    win.webContents.send('dashboard-channel', generateDashboardData(miners));
  
    //chart
    win.webContents.send('chart-channel', generateChartData(miners));
  
    //miners
    win.webContents.send('miners-channel', generateMinerData(miners)); 
  
    //pools
    // win.webContents.send('pools-channel', []); 
  
    //settings
    // win.webContents.send('settings-channel', []); 
  
    return immediate;
  }(), settings.requestInterval);
}

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
  var avgDifficultyString = avgDifficulty || "N/A";
  var lastAcceptedShareString = new Date(lastAcceptedShareTime*1000).toString() || "Disconnected";

  return {
    "total-hashrate": totalHashrateString,
    "accepted-rejected-shares": shareString,
    "active-miners": activeMinerString,
    "current-pool": currentPoolString,
    "avg-difficulty": avgDifficultyString,
    "last-accepted-share-time": lastAcceptedShareString.substr(0, 24)
  };
}

function MHToHRString(totalHashrate){
  if (totalHashrate < 1000) totalHashrateString = totalHashrate + " MH/s";
  else if (totalHashrate > 1000 && totalHashrate <= 1000000) totalHashrateString = totalHashrate/1000 + " GH/s";
  else if (totalHashrate > 1000000 && totalHashrate <= 1000000000) totalHashrateString = totalHashrate/1000000 + " TH/s";
  else totalHashrateString = totalHashrate/1000000000 + " PH/s";
  return totalHashrateString
}

function generateMinerData(miners){
  var headers = ['Name', 
    'Software', 
    'Coin', 
    'Algorithm', 
    'Pool',
    'User', 
    'Started', 
    'Last Work', 
    'Uptime', 
    'Work Received', 
    'Active HBs', 
    'Hashrate', 
    'Accepted', 
    'Rejected', 
    'Submitted',
    'Last Accepted Share',
    'Difficulty',
    'Fan Speed',
    'Temperatures (C)'];

  var data = [];
  
  miners.forEach(m => {
    if (m.active) {
      var datum = ['John Lee',
        m.response["Software"] || "N/A",
        m.response["Mining"]["Coin"] || "N/A",
        m.response["Mining"]["Algorithm"] || "N/A",
        m.response["Stratum"]["Current Pool"] || "N/A",
        m.response["Stratum"]["Current User"] || "N/A",
        new Date(m.response["Session"]["Startup Timestamp"]*1000) || "N/A",
        new Date(m.response["Session"]["Last Work Timestamp"]*1000) || "N/A",
        m.response["Session"]["Uptime"] || "N/A",
        m.response["Session"]["WorkReceived"] || "N/A",
        m.response["Session"]["Active HBs"] || "N/A",
        MHToHRString(m.response["Session"]["Average MHs"]) || "N/A",
        m.response["Session"]["Accepted"] || "N/A",
        m.response["Session"]["Rejected"] || "N/A",
        m.response["Session"]["Submitted"] || "N/A",
        new Date(m.response["Session"]["Last Accepted Share Timestamp"]*1000) || "N/A",
        m.response["Session"]["Difficulty"] || "N/A",
        'todo',
        // m.response["Fans"]["Fans Speed"] || "N/A",
        (m.response["HBs"][0]["Temperature"] || "N/A") + ' / ' 
          + (m.response["HBs"][1]["Temperature"] || "N/A") + ' / '
          + (m.response["HBs"][2]["Temperature"] || "N/A")];
        data.push(datum);

    } else {

      data.push(['Disconnected']);
    }
  });

  return {"headers": headers,
    "data": data};
}

var data = [];
var pdata = []
function generateChartData(miners){
  var hr = 0;
  var power = 0;
  miners.forEach(m => {
    if (m.active) {
      hr += m.response["Session"]["Average MHs"]/1000;
      for (var i = 0; i < m.response["Session"]["Active HBs"]; i++){
        power += m.response["HBs"][i]["Input Power"];
      }
    }
  });
  data.push({x: Date.now(), y: hr});
  pdata.push({x: Date.now(), y: power});
  return {
    "hr-chart": data,
    "p-chart": pdata
  };
}