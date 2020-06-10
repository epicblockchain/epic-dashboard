const { app, BrowserWindow, screen } = require('electron')
// var mdns = require('multicast-dns')()
const fs = require('fs');
const dnssd = require('dnssd2');
 


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

const browser = dnssd.Browser(dnssd.tcp('epicminer'))
  .on('serviceUp',function(service){
    var ip = service.addresses[0];
    var port = service.port;
    var settings = JSON.parse(fs.readFileSync('settings.json'));
    settings.apiIP = ip;
    settings.apiPort = port;
    fs.writeFileSync('settings.json', settings);
  })
  .on('serviceDown', service => console.log("Device down: ", service))//use this maybe?
  .start();