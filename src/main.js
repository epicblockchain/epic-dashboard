const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const got = require('got');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const sha256 = require('sha256-file');
const {Worker} = require('worker_threads');
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1536,
        minWidth: 800,
        height: 864,
        icon: __dirname + '/img/epic.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // scrolls log file to bottom of page
    mainWindow.webContents.on('did-create-window', (childWindow) => {
        childWindow.webContents.executeJavaScript('window.scrollTo(0, document.body.scrollHeight)');
    });
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Hide menu bar
    mainWindow.setMenuBarVisibility(false);

    ipcMain.handle('portscan', (event, ip, range, timeout) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(path.resolve(__dirname, 'portscan.js'));
            worker.postMessage({ip: ip, range: range, timeout: timeout});
            worker.on('message', (ips) => {
                resolve(ips);
            });
        });
    });

    ipcMain.handle('version', () => app.getVersion());

    ipcMain.handle('dialog-open', (event, properties) => {
        return dialog.showOpenDialog(properties);
    });

    ipcMain.on('form-post', (event, miners, api, data, selected) => {
        for (const i of selected) {
            (async () => {
                const f = new FormData();
                f.append('password', data.password);
                f.append('checksum', sha256(data.filepath));
                f.append('keepsettings', data.keep.toString());
                f.append('swupdate.swu', fs.createReadStream(data.filepath));

                try {
                    event.reply('form-post-reply', i, 'info', `${miners[i].address}: Updating in progress`);

                    const {body} = await got.post(`http://${miners[i].address}:4028${api}`, {
                        body: f,
                        responseType: 'json',
                        timeout: 600000, // 60000 was 1 min before
                    });

                    if (body.result) {
                        mainWindow.webContents.send(
                            'form-result',
                            i,
                            'success',
                            `${miners[i].address}: Done firmware update`
                        );
                    } else {
                        mainWindow.webContents.send('form-result', i, 'error', `${miners[i].address}: ${body.error}`);
                    }
                } catch (err) {
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
