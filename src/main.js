const { app, BrowserWindow, ipcMain } = require('electron');
const got = require('got');
const fs = require('fs');
const FormData = require('form-data');
const sha256 = require('sha256-file');
require('@electron/remote/main').initialize();
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1536,
        height: 864,
        icon: __dirname + '/img/favicon.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Hide menu bar
    mainWindow.setMenuBarVisibility(false);

    ipcMain.on('form-post', (event, miners, api, data, selected) => {
        for (let i of selected) {
            (async () => {
                var f = new FormData();
                f.append('password', data.password);
                f.append('checksum', sha256(data.filepath));
                f.append('keepsettings', data.keep.toString());
                f.append('swupdate.swu', fs.createReadStream(data.filepath));

                try {
                    event.reply('form-post-reply', i, 'info', `${miners[i].address}: Updating in progress`);

                    const {body} = await got.post(`http://${miners[i].address}:${miners[i].service.port}${api}`, {
                        body: f,
                        responseType: 'json',
                        timeout: 600000 //60000 was 1 min before
                    });

                    if (body.result) {
                        mainWindow.webContents.send('form-result', i, 'success', `${miners[i].address}: Done firmware update`);
                    } else {
                        mainWindow.webContents.send('form-result', i, 'error', `${miners[i].address}: ${body.error}`);
                    }
                } catch(err) {
                    console.log(err);
                }
            })();
        }
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.