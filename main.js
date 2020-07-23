const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron')
// var mdns = require('multicast-dns')()
const dnssd = require('dnssd2');
const fs = require("fs");
var win;
function createWindow () {
  // Create the browser window.

  const screenArea = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 1600, //i will make this smaller for release
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.

  // win.webContents.openDevTools();

  //hide the janky top menu for now, since I dont think it will be useful
  win.removeMenu(); //this may not work on mac
  //this section is if we want our own menu, but rn not needed
  // const template = [];
  // const menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
  .then(epicInit)
  .then(createWindow);

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

//api access logic entry
var minerinfo = require('./custom/MinerInfo');
var dm = require('./custom/EpicMinerDataMassager');

var miners = []; //this will also hold inactive miners
var timer;

var chartData;

var first = true;

function epicInit(){
  chartData = [];
  miners = [];
  if (timer) {
    clearInterval(timer); //if for some reason we re-init in the future, get rid of the current loop
  }
  console.log('initializing miners');
  console.log('searching for miners')
  const browser = dnssd.Browser(dnssd.tcp('epicminer'))
  .on('serviceUp',function(service){
    var ip = service.addresses[0];
    var port = service.port;
    m = new minerinfo.MinerInfo(
        ip,
        port
      );
    miners.push(m);
    console.log('found miner at: ' + ip + ':' + port);
  })
  .start();

  //send the first https requests
  setTimeout(function(){
    browser.stop();
    console.log('done searching for miners');
    if (first){
      initViewToModelChannels(); first = false;
    } 
    //run once immediately after done searching for miners

    //check for ipaddr file
    try {
      if (fs.existsSync('ipaddr.txt')) {
        console.log("Found ipaddr.txt file.");
        var ipaddr = fs.readFileSync('ipaddr.txt');
        ipaddr = ipaddr.toString().split('\n');
        ipaddr.forEach(el => {
          var found = 0;
          var pair = el.split(':');
          miners.forEach(m => {
            if (m.ip === el.split(':')[0]) {
              found = 1;
            }
          });
          if (found == 0) {
            miners.push(new minerinfo.MinerInfo(
              pair[0],
              pair[1]
            ));
          }   
        });
      } else {
        console.log("No ipaddr.txt file found.");
      }
    } catch(err) {
      console.error(err)
    }

    miners.forEach(m => {
      m.fetchHistory();
      m.fetchSummary();
    });
  }, 3000);

  //actually use the http requests
  setTimeout(function(){
    chartData = dm.loadHistoryChartData(miners);
    epicLoop();
    timer = setInterval(() => {
      //run every request interval
      epicLoop();
    }, 3000);
  }, 6000);
};

//this functions loop is managed by init
function epicLoop() {
  miners.forEach(m => {
    if (m.alive) m.fetchSummary();
  });

  //dashboard
  win.webContents.send('dashboard-channel', dm.generateDashboardData(miners));

  //chart
  win.webContents.send('chart-channel', dm.generateChartData(miners, chartData));

  //miners
  win.webContents.send('miners-channel', dm.generateMinerData(miners));

  //settings
  win.webContents.send('settings-miner-list', dm.generateSettingsMinerList(miners));

  // win.webContents.send('settings-channel', []); 
}

var swupdate_filepath = '';
function initViewToModelChannels(){
  ipcMain.on('refresh', (event, arg) => {
    epicInit();
    event.reply('refresh-reply', 'Refreshed!');
  });
  
  ipcMain.on('post-settings', (event, arg) => {
    miners.forEach(m => {
      if (m.active) {
        if (arg.applyTo[m.ip+':'+m.port]){
          m.post({
            "method": arg.method,
            "param": arg.param,
            "password": arg.password
          },
          win
          );
        };
      }
    });
  });

  ipcMain.on('swupdate-browse', (event, arg) => {
    dialog.showOpenDialog({
      properties: ['openFile']
    }).then(result => {
      if (!result.canceled){
        swupdate_filepath = result.filePaths[0];
        event.reply('swupdate-browse-reply', result.filePaths);
      }
    }).catch(err => {
      console.log(err);
    });
  });
  
}

