const {app, BrowserWindow, ipcMain, dialog, shell, screen} = require('electron');
import got from 'got';
import {createFirmwareUpload} from './firmwareUpload.mjs';
import {formatApiError} from './apiCompatibility.mjs';
import {minerRequest} from './minerHttp.mjs';
import {getInitialWindowBounds} from './windowLayout.mjs';
const path = require('path');
const {Worker} = require('worker_threads');
import 'core-js/stable';
import 'regenerator-runtime/runtime';

let mainWindow;
let isQuitting = false;
let waitingForRenderer = false;
let quitFallbackTimer;

function finishQuit() {
    if (isQuitting) return;
    isQuitting = true;
    waitingForRenderer = false;
    clearTimeout(quitFallbackTimer);
    app.quit();
}

function requestRendererFlush() {
    if (isQuitting || waitingForRenderer) return;

    const window = BrowserWindow.getAllWindows()[0];
    if (!window || window.isDestroyed()) {
        finishQuit();
        return;
    }

    waitingForRenderer = true;
    window.webContents.send('flush-before-quit');
    quitFallbackTimer = setTimeout(finishQuit, 5000);
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    const workArea = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        ...getInitialWindowBounds(workArea),
        center: true,
        frame: false,
        icon: __dirname + '/img/epic.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.on('close', (event) => {
        if (isQuitting) return;
        event.preventDefault();
        requestRendererFlush();
    });
    // scrolls log file to bottom of page
    mainWindow.webContents.on('did-create-window', (childWindow) => {
        childWindow.webContents.executeJavaScript('window.scrollTo(0, document.body.scrollHeight)');
    });
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

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

    ipcMain.handle('open-external', (event, url) => {
        return shell.openExternal(url);
    });

    ipcMain.on('minimize', () => {
        mainWindow.minimize();
    });

    ipcMain.on('form-post', (event, miners, api, data, selected) => {
        for (const i of selected) {
            (async () => {
                try {
                    const upload = await createFirmwareUpload(api, data);
                    event.reply('form-post-reply', i, 'info', `${miners[i].address}: Updating in progress`);

                    const {body} = await got.post(`http://${miners[i].address}:4028${api}`, {
                        ...upload,
                        responseType: 'json',
                        timeout: {request: 600000},
                        retry: {limit: 0},
                    });

                    if (body.result) {
                        mainWindow.webContents.send(
                            'form-result',
                            i,
                            'success',
                            `${miners[i].address}: Done firmware update`,
                        );
                    } else {
                        mainWindow.webContents.send(
                            'form-result',
                            i,
                            'error',
                            `${miners[i].address}: ${formatApiError(body.error)}`,
                        );
                    }
                } catch (err) {
                    console.log(err);
                }
            })();
        }
    });
};

ipcMain.handle('user-data-path', () => app.getPath('userData'));

ipcMain.handle('miner-request', (_event, url, options) => minerRequest(url, options));

ipcMain.on('quit', () => {
    app.quit();
});

ipcMain.on('quit-ready', finishQuit);

app.on('before-quit', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    requestRendererFlush();
});

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
