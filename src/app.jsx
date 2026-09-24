const {ipcRenderer} = require('electron');
import got from './rendererHttp';
const path = require('path');
const fs = require('fs');
const os = require('os');
const {createLogger, transports} = require('winston');

import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {Dashboard} from './dashboard.jsx';
import {DataTable, DEFAULT_HIDDEN_COLUMNS, normalizeTablePreferences} from './table.jsx';
import {Preferences} from './preferences.jsx';
import {Support} from './support.jsx';
import {Eula} from './eula.jsx';
import {buildBoardEnableRequest} from './boardControl.mjs';
import {formatApiError} from './apiCompatibility.mjs';
import {
    getMinerModelGroups,
    getTuneCapableModels,
    haveSameModels,
    normalizeMinerModelName,
    UNKNOWN_MODEL,
} from './minerTable.mjs';

import {
    Drawer,
    ListItem,
    ListItemButton,
    ListItemText,
    Button,
    IconButton,
    List,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CssBaseline,
    TextField,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Tooltip,
    Link,
    InputAdornment,
} from '@mui/material';
import {toast} from 'react-toastify';
import {Notifications, notify} from './notifications.jsx';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import PermScanWifiIcon from '@mui/icons-material/PermScanWifi';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import './app.css';
import icon from './img/epic.png';
import darkLogo from './img/EpicLogoDark.png';
import lightLogo from './img/EpicLogoLight.png';
import {createTheme, ThemeProvider} from '@mui/material/styles';

const light = createTheme({
    palette: {
        primary: {main: '#0068B4'},
        secondary: {main: '#0068B4'},
        text: {
            success: '#fff',
            error: '#fff',
            secondary: '#8F8F8F',
        },
        background: {
            default: '#f6f6f6',
            paper: '#fff',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '.datatable-wrap': {
                    backgroundColor: '#fff',
                },
                '.resizer': {
                    border: '8px solid #fafafa',
                    background: '#aaa',
                    '&.isResizing': {
                        background: '#2FC1DE',
                    },
                },
                '.unique-id-label': {
                    color: '#0000008a',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    color: '#000000',
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    paddingLeft: '16px',
                    backgroundColor: 'white',
                },
            },
        },
        Grid: {
            styleOverrides: {
                borderBottom: '1px solid #0000001f',
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    head: {
                        hover: {
                            backgroundColor: 'inherit',
                        },
                    },
                    hover: {
                        backgroundColor: '#0000000a',
                    },
                    selected: {
                        backgroundColor: '#1b1d4d14 !important',
                        hover: {
                            backgroundColor: '#1b1d4d1f !important',
                        },
                    },
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#fff',
                    color: '#ffffff80',
                },
            },
        },
    },
});

const dark = createTheme({
    palette: {
        mode: 'dark',
        primary: {main: '#2FC1DE'},
        secondary: {main: '#2FC1DE'},
        text: {
            success: '#000',
            error: '#fff',
        },
        background: {
            default: '#171717',
            paper: '#2F2F2F',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '*::-webkit-scrollbar': {
                    width: '1.25em',
                    height: '1.25em',
                    backgroundColor: '#202022',
                },
                '*::-webkit-scrollbar-corner': {
                    backgroundColor: '#202022',
                },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: '#585859',
                    border: '3px solid #202022',
                    borderRadius: '8px',
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#999',
                },
                '.datatable-wrap': {
                    backgroundColor: '#303030',
                },
                '.resizer': {
                    border: '8px solid #303030',
                    background: '#aaa',
                    '&.isResizing': {
                        background: '#2FC1DE',
                    },
                },
                '.unique-id-label': {
                    color: '#ffffffb3',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    color: 'white',
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2f2f2f',
                },
            },
        },
        Grid: {
            styleOverrides: {
                borderBottom: '1px solid #ffffff1f',
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    head: {
                        hover: {
                            backgroundColor: 'inherit',
                        },
                    },
                    hover: {
                        backgroundColor: '#ffffff14',
                    },
                    selected: {
                        backgroundColor: '#ffc10729 !important',
                        hover: {
                            backgroundColor: '#ffc1073d !important',
                        },
                    },
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#171717',
                    color: '#ffffff80',
                },
            },
        },
    },
});

const miners = [];
let blacklist = [];
let app_path = '';
let version = 'ePIC Dashboard v';
const networks = {};

switch (process.platform) {
    case 'darwin':
        app_path = path.join(process.env.HOME, 'Library', 'Application Support', 'ePIC-Dashboard');
        break;
    case 'win32':
        app_path = path.join(process.env.APPDATA, 'ePIC-Dashboard');
        break;
    case 'linux':
        app_path = path.join(process.env.HOME, '.ePIC-Dashboard');
        break;
    default:
        console.log('Unsupported platform: ' + process.platform);
        ipcRenderer.send('quit');
}

const legacyAppPath = app_path;

async function migrateLegacyAppData(userDataPath) {
    if (path.resolve(legacyAppPath) === path.resolve(userDataPath)) {
        return;
    }

    const files = ['settings.json', 'default.json', 'ipaddr.txt', 'blacklist.txt', 'errors.log'];
    await fs.promises.mkdir(userDataPath, {recursive: true});

    for (const filename of files) {
        const source = path.join(legacyAppPath, filename);
        const target = path.join(userDataPath, filename);

        try {
            await fs.promises.access(source);
            await fs.promises.access(target);
            continue;
        } catch {
            // Either the legacy file or the destination is missing.
        }

        try {
            await fs.promises.copyFile(source, target);
        } catch {
            // There may be no legacy file to migrate.
        }
    }
}

const appPathReady = ipcRenderer
    .invoke('user-data-path')
    .then(async (userDataPath) => {
        await migrateLegacyAppData(userDataPath);
        await fs.promises.mkdir(userDataPath, {recursive: true});
        app_path = userDataPath;
        return app_path;
    })
    .catch(async (error) => {
        console.log('Unable to resolve the Electron user data path:', error);
        await fs.promises.mkdir(app_path, {recursive: true}).catch(() => {});
        return app_path;
    });

appPathReady.then(() => {
    createLogger({
        exceptionHandlers: [new transports.File({filename: path.join(app_path, 'errors.log')})],
        rejectionHandlers: [new transports.File({filename: path.join(app_path, 'errors.log')})],
        exitOnError: false,
    });
});

const nets = os.networkInterfaces();

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!networks[name]) {
                networks[name] = [];
            }
            networks[name].push(net.address);
        }
    }
}

appPathReady.then(() => {
    fs.readFile(path.join(app_path, 'blacklist.txt'), (err, data) => {
        if (err) {
            console.log('blacklist.txt not found');
            return;
        }
        blacklist = data.toString().split('\n');
        console.log(blacklist);
    });
});

class Mutex {
    constructor() {
        this.mutex = Promise.resolve();
    }

    lock() {
        let begin = null;
        this.mutex = this.mutex.then(() => new Promise(begin));
        return new Promise((res) => (begin = res));
    }
}

const minerMutex = new Mutex();

class RendererErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null};
    }

    static getDerivedStateFromError(error) {
        return {error};
    }

    componentDidCatch(error, info) {
        console.error('Dashboard rendering failed:', error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div
                    role="alert"
                    style={{
                        alignItems: 'center',
                        background: '#f6f6f6',
                        boxSizing: 'border-box',
                        color: '#222',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        justifyContent: 'center',
                        padding: 24,
                        textAlign: 'center',
                    }}
                >
                    <h1>Dashboard view failed to load</h1>
                    <p>The dashboard hit an unexpected error. Reload the app to continue.</p>
                    <button onClick={() => window.location.reload()}>Reload dashboard</button>
                </div>
            );
        }

        return this.props.children;
    }
}

async function writeJsonAtomically(filename, value) {
    const tempFilename = `${filename}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
    let fileHandle;

    try {
        fileHandle = await fs.promises.open(tempFilename, 'w');
        await fileHandle.writeFile(value, 'utf8');
        await fileHandle.sync();
        await fileHandle.close();
        fileHandle = null;
        await fs.promises.rename(tempFilename, filename);
    } catch (error) {
        if (fileHandle) {
            await fileHandle.close().catch(() => {});
        }
        await fs.promises.unlink(tempFilename).catch(() => {});
        throw error;
    }
}

function parseHistorySamples(body) {
    try {
        const history = JSON.parse(body)?.History;
        return Array.isArray(history) ? history.slice(-48) : [];
    } catch {
        return [];
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerOpen: false,
            page: 'main',
            miner_data: [],
            models: [],
            tunecap: [],
            portscan: false,
            modal: false,
            eula: false,
            theme: 'light',
            scanIp: '',
            scanRange: '24',
            scanTimeout: '500',
            defaultTable: {
                hiddenColumns: Array.from(DEFAULT_HIDDEN_COLUMNS),
                __columnOrder: [],
                columnSizing: {},
                sorting: [],
                columnFilters: [],
            },
            defaultTableLoaded: false,
        };

        this.defaultTableWrite = Promise.resolve();
        this.defaultTableWriteActive = false;
        this.pendingDefaultTable = null;

        this.setPage = this.setPage.bind(this);
        this.addMiner = this.addMiner.bind(this);
        this.delMiner = this.delMiner.bind(this);
        this.savePreferences = this.savePreferences.bind(this);
        this.saveDefault = this.saveDefault.bind(this);
        this.saveMiners = this.saveMiners.bind(this);
        this.loadMiners = this.loadMiners.bind(this);
        this.blacklist = this.blacklist.bind(this);
        this.handleApi = this.handleApi.bind(this);
        this.handleFormApi = this.handleFormApi.bind(this);
        this.setScan = this.setScan.bind(this);
        this.clearUndefined = this.clearUndefined.bind(this);
        this.retryPromise = this.retryPromise.bind(this);
        this.flushBeforeQuit = this.flushBeforeQuit.bind(this);
    }

    retryPromise(fn, retries = 3) {
        return new Promise((resolve, reject) => {
            fn()
                .then(resolve)
                .catch((error) => {
                    if (retries > 0) {
                        console.log('retry');
                        return this.retryPromise(fn, retries - 1)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        console.log('error');
                        reject(error);
                    }
                });
        });
    }

    queueDefaultTableWrite(defaultTable) {
        this.pendingDefaultTable = defaultTable;
        if (this.defaultTableWriteActive) {
            return this.defaultTableWrite;
        }

        this.defaultTableWriteActive = true;
        this.defaultTableWrite = (async () => {
            try {
                const directory = await appPathReady;
                await fs.promises.mkdir(directory, {recursive: true});

                while (this.pendingDefaultTable) {
                    const nextTable = this.pendingDefaultTable;
                    this.pendingDefaultTable = null;
                    await writeJsonAtomically(path.join(directory, 'default.json'), JSON.stringify(nextTable));
                }
            } catch (error) {
                console.log('Unable to save table preferences:', error);
                this.pendingDefaultTable = null;
            } finally {
                this.defaultTableWriteActive = false;
            }
        })();

        return this.defaultTableWrite;
    }

    async flushBeforeQuit() {
        let write = this.defaultTableWrite;
        do {
            await write;
            write = this.defaultTableWrite;
        } while (this.defaultTableWriteActive || write !== this.defaultTableWrite);
        ipcRenderer.send('quit-ready');
    }

    async summary(init) {
        let models = new Set(this.state.models.map((model) => normalizeMinerModelName(model)).filter(Boolean));
        const unlock = await minerMutex.lock();
        let miner_data = await Promise.all(
            miners.map(async (miner, i) => {
                try {
                    const summary = await got(`http://${miner.address}:4028/summary`, {
                        timeout: {request: 2000},
                        retry: {limit: 0},
                    });
                    let sum = JSON.parse(summary.body);

                    const network = await got(`http://${miner.address}:4028/network`, {
                        timeout: {request: 2000},
                        retry: {limit: 0},
                    });
                    const net = JSON.parse(network.body);
                    if (!sum.Hostname) sum = null;

                    const match = this.state.miner_data.find((a) => a.ip == miner.address);

                    if (
                        init ||
                        !match ||
                        match.sum == 'load' ||
                        match.sum == 'reboot' ||
                        match.sum == null ||
                        !normalizeMinerModelName(match.cap?.Model) ||
                        !match.cap
                    ) {
                        const history = await got(`http://${miner.address}:4028/history`, {
                            timeout: {request: 2000},
                            retry: {limit: 0},
                        });
                        const historySamples = parseHistorySamples(history.body);
                        try {
                            const cap = await got(`http://${miner.address}:4028/capabilities`, {
                                timeout: {request: 2000},
                                retry: {limit: 0},
                            });
                            const content = JSON.parse(cap.body);

                            const modelName = normalizeMinerModelName(content?.Model);
                            if (modelName) models.add(modelName);
                            else models.add(UNKNOWN_MODEL);

                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist: historySamples,
                                cap: modelName ? content : undefined,
                                timer: 10,
                            };
                        } catch (err) {
                            console.log(err);
                            models.add(UNKNOWN_MODEL);
                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist: historySamples,
                                timer: 10,
                            };
                        }
                    } else {
                        const lastMHs = sum.Session.LastAverageMHs;

                        if (lastMHs == null) {
                            return {ip: miner.address, sum: sum, hist: [], cap: match.cap, network: net, timer: 10};
                        } else if (!Array.isArray(match.hist) || match.hist.length === 0) {
                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist: lastMHs ? [lastMHs] : [],
                                cap: match.cap,
                                timer: 10,
                            };
                        } else if (!match.hist.some((sample) => sample?.Timestamp === lastMHs.Timestamp)) {
                            const hist = match.hist.slice(-47);
                            hist.push(lastMHs);
                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist,
                                cap: match.cap,
                                timer: 10,
                            };
                        }
                        return {
                            ip: miner.address,
                            sum: sum,
                            network: net,
                            hist: Array.isArray(match.hist) ? match.hist : [],
                            cap: match.cap,
                            timer: 10,
                        };
                    }
                } catch {
                    const match = this.state.miner_data.find((a) => a.ip == miner.address);

                    if (match) {
                        if (match.timer > 0) {
                            return {
                                ip: miner.address,
                                sum: match.sum && typeof match.sum === 'object' ? match.sum : null,
                                network: match.network ? match.network : null,
                                hist: Array.isArray(match.hist) ? match.hist : [],
                                cap: match.cap ? match.cap : null,
                                timer: match.timer - 1,
                            };
                        }

                        models.add(UNKNOWN_MODEL);
                        return {ip: miner.address, sum: null, hist: [], network: null, timer: 0};
                    } else {
                        models.add(UNKNOWN_MODEL);
                        return {ip: miner.address, sum: null, hist: [], network: null, timer: 0};
                    }
                }
            }),
        );

        miner_data = miner_data.filter((x) => x !== undefined);
        const tunecap = getTuneCapableModels(miner_data);
        models = getMinerModelGroups(models, miner_data);
        if (!haveSameModels(tunecap, this.state.tunecap)) this.setState({tunecap});
        if (!haveSameModels(models, this.state.models)) this.setState({miner_data, models}, () => unlock());
        else this.setState({miner_data: miner_data}, () => unlock());
    }

    compare(a, b) {
        if (a.address > b.address) return 1;
        else if (a.address < b.address) return -1;
        else return 0;
    }

    async portscan(ip, range, timeout) {
        notify('info', 'Scanning for miners...', {
            autoClose: (range === '16' ? 120000 : range === '22' ? 8000 : 2000) + parseInt(timeout),
            hideProgressBar: false,
            pauseOnHover: false,
            toastId: 'scan',
        });

        let scan_results;
        try {
            scan_results = await ipcRenderer.invoke('portscan', ip, range, timeout);
        } catch (error) {
            toast.dismiss('scan');
            console.error('Miner scan failed:', error);
            notify('error', `Miner scan failed: ${String(error)}`);
            return;
        }
        scan_results = scan_results.filter((a) => !blacklist.includes(a.name));

        const prev = miners.map((a) => a.address);
        const discovered = [];
        for (const obj of scan_results) {
            if (!prev.includes(obj.ip)) {
                miners.push({address: obj.ip, name: obj.name});
                discovered.push(obj);
            }
        }

        if (discovered.length) {
            this.setState(
                (state) => ({
                    miner_data: state.miner_data.concat(
                        discovered.map(({ip}) => ({ip, sum: 'load', hist: [], network: 'load', timer: 0})),
                    ),
                    // Give newly discovered miners a table while their model information loads.
                    models: state.models.length ? state.models : [UNKNOWN_MODEL],
                }),
                () => this.summary(false),
            );
        }

        toast.dismiss('scan');
        notify('success', `Scan complete, ${scan_results.length} miner(s) found.`);
    }

    init(settings) {
        const firstIp = Object.values(networks).flat()[0];
        const scanIp = firstIp ? firstIp.split('.').slice(0, 3).join('.') : '';
        this.setState({...settings, scanIp});

        if (settings.sessionpass) this.toggleModal(true);
        if (settings.autoload) this.loadMiners();
        if (settings.drawer !== this.state.drawerOpen) this.setState({drawerOpen: settings.drawer});
        if (settings.autoscan && firstIp) this.portscan(firstIp, 24, 500);

        this.summary(true);
        setInterval(() => this.summary(false), 6000);
    }

    async componentDidMount() {
        ipcRenderer.on('flush-before-quit', this.flushBeforeQuit);

        ipcRenderer.on('form-post-reply', (event, i, sev, text) => {
            notify(sev, text, {
                autoClose: 600000, //10 min
                hideProgressBar: false,
                pauseOnHover: false,
                toastId: i,
            });

            const ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
            const temp = Array.from(this.state.miner_data);
            temp[ind].sum = 'reboot';
            temp[ind].timer = 100; // 100 * 6sec = 10min
            this.setState({miner_data: temp});
        });

        ipcRenderer.on('form-result', (event, i, sev, text) => {
            notify(sev, text);
            toast.dismiss(i);
        });

        version += await ipcRenderer.invoke('version');

        await appPathReady;

        fs.readFile(path.join(app_path, 'settings.json'), (err, data) => {
            if (err) {
                this.setState({eula: true});
            } else {
                try {
                    this.init(JSON.parse(data));
                } catch (error) {
                    console.log('Unable to load settings:', error);
                    this.setState({eula: true});
                }
            }
        });

        fs.readFile(path.join(app_path, 'default.json'), (err, data) => {
            if (err) {
                this.setState({defaultTableLoaded: true});
                return;
            }

            try {
                this.setState({defaultTable: normalizeTablePreferences(JSON.parse(data)), defaultTableLoaded: true});
            } catch (error) {
                console.log('Unable to load table preferences:', error);
                this.setState({defaultTableLoaded: true});
            }
        });
    }

    eula(bool) {
        if (bool) {
            const settings = {theme: 'light', drawer: true, sessionpass: true, autoload: true, autoscan: true};
            this.savePreferences(settings, false);
            this.setState({eula: false}, () => {
                this.init(settings);
            });
        } else {
            ipcRenderer.send('quit');
        }
    }

    toggleDrawer(open) {
        this.setState({drawerOpen: open});
    }

    toggleModal(open) {
        this.setState({modal: open});
    }

    setScan(e, key) {
        const obj = {[key]: e.target.value};
        if (key === 'scanIp') {
            const count = e.target.value.split('.').length;
            if (this.state.scanRange === '16') {
                if (count > 2) return;
            } else {
                if (count > 3) return;
            }
        } else if (key === 'scanRange') {
            const split = this.state.scanIp.split('.');
            if (e.target.value === '16') {
                obj.scanIp = `${split[0]}.${split[1]}`;
            } else if (split.length === 2) {
                obj.scanIp = `${split[0]}.${split[1]}.0`;
            }
        }
        this.setState(obj);
    }

    setPage(page) {
        this.setState({page: page});
    }

    setSessionPass() {
        notify('success', 'Session password set');
        this.setState({sessionPass: document.getElementById('sessionPass').value, modal: false});
    }

    toggleTheme() {
        this.setState({theme: this.state.theme == 'light' ? 'dark' : 'light'});
    }

    addMiner(ip) {
        const prev = miners.map((a) => a.address);
        if (!prev.includes(ip)) {
            miners.push({address: ip});

            const temp = Array.from(this.state.miner_data);
            temp.push({ip: ip, sum: 'load', hist: [], network: 'load', timer: 0});

            const models = Array.from(this.state.models);
            const classifiedModels = models.filter((model) => normalizeMinerModelName(model));
            if (!classifiedModels.includes(UNKNOWN_MODEL)) classifiedModels.push(UNKNOWN_MODEL);

            notify('success', `Successfully added ${ip}`);
            this.setState({models: classifiedModels, miner_data: temp});
        } else {
            notify('info', `${ip} already tracked`);
        }
    }

    async delMiner(ids) {
        const temp = Array.from(this.state.miner_data);
        for (const id of ids.sort(function (a, b) {
            return b - a;
        })) {
            miners.splice(id, 1);
            temp.splice(id, 1);
        }

        const unlock = await minerMutex.lock();
        notify('success', 'Successfully removed miners');
        this.setState({miner_data: temp}, () => unlock());
    }

    async clearUndefined() {
        const temp = Array.from(this.state.miner_data);
        for (let i = temp.length - 1; i >= 0; i--) {
            if (!temp[i].sum && !temp[i].timer) {
                miners.splice(i, 1);
                temp.splice(i, 1);
            }
        }

        const unlock = await minerMutex.lock();
        notify('success', 'Successfully cleared miners');
        this.setState({miner_data: temp}, () => unlock());
    }

    savePreferences(json, notif) {
        for (const key of Object.keys(json)) {
            if (json[key] !== this.state[key]) this.setState({[key]: json[key]});
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'settings.json'), JSON.stringify(json), (err) => {
            if (err) {
                console.log(err);
                notify('error', `Unable to save preferences: ${String(err)}`);
                return;
            }
            if (notif) notify('success', 'Preferences saved');
        });
    }

    saveDefault(json) {
        const defaultTable = normalizeTablePreferences(json);

        this.setState({defaultTable});
        return this.queueDefaultTableWrite(defaultTable);
    }

    saveMiners() {
        let string = '';
        for (const miner of miners) {
            string += miner.address + '\n';
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'ipaddr.txt'), string, (err) => {
            if (err) {
                console.log(err);
                notify('error', `Unable to save miners: ${String(err)}`);
                return;
            }
            notify('success', 'Successfully saved miners');
        });
    }

    loadMiners() {
        fs.readFile(path.join(app_path, 'ipaddr.txt'), (err, data) => {
            if (err) {
                notify('error', 'No miners saved');
                console.log(err);
                return;
            }
            const ips = data.toString().split('\n');
            const prev = miners.map((a) => a.address);
            for (const ip of ips) {
                if (ip && !prev.includes(ip)) miners.push({address: ip});
            }

            notify('success', 'Successfully loaded miners');
        });
    }

    async blacklist(ids) {
        const temp = Array.from(this.state.miner_data);
        for (const id of ids.sort(function (a, b) {
            return b - a;
        })) {
            blacklist.push(miners[id].name || (temp[id].sum ? temp[id].sum.Hostname : null));
            miners.splice(id, 1);
            temp.splice(id, 1);
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'blacklist.txt'), blacklist.join('\n'), (err) => {
            if (err) {
                console.log(err);
                notify('error', `Unable to save blacklist: ${String(err)}`);
            }
        });

        const unlock = await minerMutex.lock();
        notify('success', 'Successfully blacklisted miners');
        this.setState({miner_data: temp}, () => unlock());
    }

    async handleApi(api, data, selected) {
        let obj, msg, success;
        switch (api) {
            case '/coin':
                obj = {
                    param: {
                        coin: data.coin,
                        stratum_configs: data.stratum_configs.map((x) => ({
                            pool: x.pool,
                            login: `${x.address}.${x.worker}`,
                            password: x.password,
                        })),
                        pool_url: data.stratum_configs[0].pool,
                        login: data.stratum_configs[0].address + '.' + data.stratum_configs[0].worker,
                        password: data.stratum_configs[0].password,
                        unique_id: data.checked,
                    },
                    password: data.password,
                };
                msg = 'Updating coin';
                success = 'Mining config updated successfully';
                break;
            case '/mode': {
                const param = data.power ? {preset: data.mode, power_target: data.power} : data.mode;
                obj = {param: param, password: data.password};
                msg = 'Updating operating mode';
                success = `Operating mode set to ${data.mode} ${data.power ? `@ ${data.power}W` : ''}`;
                break;
            }
            case '/password':
                obj = {param: data.pass1, password: data.password};
                success = 'Changed miner password';
                break;
            case '/softreboot':
            case '/reboot':
                obj = {param: data.delay, password: data.password};
                success = `${api === '/reboot' ? 'Reboot' : 'Mining restart'} successful`;
                break;
            case '/hwconfig':
                obj = {param: true, password: data.password};
                success = 'Recalibrate started successfully';
                break;
            case '/identify':
                obj = {param: data.checked, password: data.password};
                success = `LED turned ${data.checked ? 'on' : 'off'}`;
                break;
            case '/miner':
                obj = {param: data.cmd, password: data.password};
                msg = 'Sending command';
                success = `${data.cmd} sent successfully`;
                break;
            case '/defaultconfig':
                obj = {param: null, password: data.password};
                msg = 'Sending command';
                success = `Reset sent successfully`;
                break;
            case '/tune':
                obj = {
                    param: {
                        clks: data.clock.toString(),
                        voltage: (data.voltage * 1000).toString(),
                    },
                    password: data.password,
                };
                success = `Tuned voltage to ${data.voltage} and clock to ${data.clock}`;
                break;
            case '/fanspeed':
                if (data.autofan) {
                    obj = {
                        param: {Auto: {'Target Temperature': data.target_temp, 'Idle Speed': data.idle_speed}},
                        password: data.password,
                    };
                    success = `Fan mode set to Auto with target ${data.target_temp}\u00b0C and idle speed ${data.idle_speed}%`;
                } else {
                    obj = {param: data.speed, password: data.password};
                    success = `Fan speed set to ${data.speed}%`;
                }
                break;
            case '/test':
                obj = {param: {test: data.test, miner_type: data.type}, password: data.password};
                msg = `Running debug test: ${data.test}`;
                success = `${data.test} debug test completed`;
                break;
            case '/wifi':
                obj = {param: {ssid: data.ssid, psk: data.psk}, password: data.password};
                msg = 'Updating wifi ssid and psk';
                success = 'Wifi config updated';
                break;
            case '/perpetualtune':
                obj = {param: data.checked, password: data.password};
                success = `Perpetual tune enable: ${data.checked}`;
                break;
            case '/perpetualtune/errorthrottle':
                obj = {param: data.errorthrottle, password: data.password};
                success = `Perpetual tune error throttle: ${data.errorthrottle}`;
                break;
            case '/perpetualtune/algo':
                obj = {
                    param: {
                        algo: data.algo,
                        target: data.num,
                        min_throttle: data.throttle,
                        throttle_step: data.step,
                    },
                    password: data.password,
                };
                success = `Perpetual tune algorithm changed to ${data.algo} with target ${data.num}`;
                break;
            case '/perpetualtune/reset':
                obj = {param: data.algo, password: data.password};
                success = 'Perpetual tune reset sent successfully';
                break;
            case '/criticaltemp':
                obj = {param: data.criticaltemp, password: data.password};
                success = `Critical Temperature set to ${data.criticaltemp}`;
                break;
            case '/shutdowntemp':
                obj = {param: data.shutdowntemp, password: data.password};
                success = `Shutdown Temperature set to ${data.shutdowntemp}`;
                break;
            case '/id/variant':
                obj = {param: data.unique_variant, password: data.password};
                success = `Unique Id Variant set to ${data.unique_variant}`;
                break;
            case '/overdrive':
                obj = {param: data.overdrive, password: data.password};
                success = `Overdrive set to ${data.overdrive}`;
                break;
            case '/idleonconnectionlost':
                obj = {param: data.is_idle_on_connection_lost, password: data.password};
                success = `Idle on connection lost set to ${data.is_idle_on_connection_lost}`;
                break;
            case '/fans/minimum':
                obj = {param: data.min_working_fans, password: data.password};
                success = `Minimum working fans set to ${data.min_working_fans}`;
                break;
            case '/preinitcooldownmaxduration':
                obj = {param: data.preinit_cooldown_max_duration, password: data.password};
                success = `Preinit cooldown max duration set to ${data.preinit_cooldown_max_duration}s`;
                break;
            case '/timezone':
                obj = {param: data.timezone, password: data.password};
                success = `Timezone set to ${data.timezone}`;
                break;
            case '/disableboardonfailure':
                obj = {param: data.disable_board_on_failure, password: data.password};
                success = `Disable board on failure set to ${data.disable_board_on_failure}`;
                break;
            case '/enableboardsonidle':
                obj = {param: data.enable_boards_on_idle, password: data.password};
                success = `Enable boards on idle set to ${data.enable_boards_on_idle}`;
                break;
            case '/boardenable':
                success = 'Board settings updated successfully';
                break;
            case '/loadlicense':
                obj = {param: {key: data.license_key}, password: data.password};
                success = `License uploaded`;
                break;
            case '/hashratesplit':
                obj = {
                    param: data.hashrate_splits.map((split) => ({
                        coin: split.coin,
                        stratum_configs: split.stratum_configs.map((x) => ({
                            pool: x.pool,
                            login: `${x.address}.${x.worker}`,
                            password: x.password,
                        })),
                        unique_id: split.unique_variant ? true : false,
                        ratio: split.ratio,
                        unique_worker_id_variant: split.unique_variant || null,
                    })),
                    password: data.password,
                };
                msg = 'Updating hashrate split config';
                success = 'Hashrate split config updated successfully';
                break;
            case '/hashratesplit/enable':
                obj = {param: data.hashrate_split_enabled, password: data.password};
                success = `Hashrate split ${data.hashrate_split_enabled ? 'enabled' : 'disabled'}`;
                break;
        }

        const slow_api =
            api == '/coin' ||
            api == '/miner' ||
            api == '/mode' ||
            api == '/test' ||
            api == '/wifi' ||
            api == '/hashratesplit'; //sends response after completed
        const soft_reboot = api == '/softreboot' || api == '/hwconfig' || api == '/power'; //sends response early

        const MAX_CONCURRENT_REQUESTS = 5;
        let promises = [];
        let allSuccess = true;
        for (const i of selected) {
            const promise = this.retryPromise(async () => {
                try {
                    if (slow_api) {
                        notify('info', `${miners[i].address}: ${msg}`, {
                            autoClose: api === '/test' ? (data.test !== 'Ft4' ? 220000 : 1000000) : 60000,
                            hideProgressBar: false,
                            pauseOnHover: false,
                            toastId: i,
                        });

                        if (api !== '/test') {
                            const ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                            const temp = Array.from(this.state.miner_data);
                            if (!temp[ind].sum.Status) {
                                temp[ind].sum = 'reboot';
                                temp[ind].timer = 10; //10 * 6sec = 1min
                                this.setState({miner_data: temp});
                            }
                        }
                    }

                    const requestBody =
                        api === '/boardenable'
                            ? buildBoardEnableRequest(
                                  data.board_states,
                                  this.state.miner_data[i]?.sum,
                                  data.password,
                                  this.state.miner_data[i]?.cap?.['Max HBs'],
                              )
                            : obj;
                    const {body} = await got.post(`http://${miners[i].address}:4028${api}`, {
                        json: requestBody,
                        timeout: {
                            request: slow_api
                                ? api === '/test'
                                    ? data.test !== 'Ft4'
                                        ? 220000
                                        : 1000000
                                    : 60000
                                : 5000,
                        },
                        responseType: 'json',
                    });

                    if (slow_api) toast.dismiss(i);

                    if (body?.result === true) {
                        notify('success', `${miners[i].address}: ${success}`);

                        if (api == '/reboot' || soft_reboot) {
                            const ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                            const temp = Array.from(this.state.miner_data);
                            if (!temp[ind].sum.Status) {
                                temp[ind].sum = 'reboot';
                                temp[ind].timer = 10; //10 * 6sec = 1min
                                this.setState({miner_data: temp});
                            }
                        } else if (api === '/identify') {
                            try {
                                const ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                                const summary = await got(`http://${miners[i].address}:4028/summary`, {
                                    timeout: {request: 2000},
                                    retry: {limit: 0},
                                });

                                const sum = JSON.parse(summary.body);
                                const temp = Array.from(this.state.miner_data);
                                temp[ind].sum = sum;

                                const unlock = await minerMutex.lock();
                                if (sum.Hostname) this.setState({miner_data: temp}, () => unlock());
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        return true;
                    } else {
                        const apiError = formatApiError(body?.error ?? body);
                        notify('error', `${miners[i].address}: ${apiError}`);
                        return false;
                    }
                } catch (err) {
                    console.log(err);
                    const statusCode = err?.response?.statusCode;
                    const reason =
                        statusCode === 404 ? `API operation ${api} was not found` : formatApiError(err?.message ?? err);
                    notify(statusCode === 404 ? 'warning' : 'error', `${miners[i].address}: ${reason}`);
                    return false;
                }
            });
            promises.push(promise);
            if (promises.length >= MAX_CONCURRENT_REQUESTS) {
                const results = await Promise.all(promises);
                if (results.some((r) => r === false)) allSuccess = false;
                promises = [];
            }
        }
        if (promises.length > 0) {
            const results = await Promise.all(promises);
            if (results.some((r) => r === false)) allSuccess = false;
        }
        return allSuccess;
    }

    handleFormApi(api, data, selected) {
        ipcRenderer.send('form-post', miners, api, data, selected);
    }

    render() {
        const prefix16 = this.state.scanRange === '16';
        const logo = this.state.theme === 'light' ? lightLogo : darkLogo;

        return (
            <ThemeProvider theme={this.state.theme == 'light' ? light : dark}>
                <CssBaseline />
                <div id="topbar">
                    <div id="titlebar">
                        <img src={icon} />
                        ePIC Dashboard
                    </div>
                    <button id="minimize" title="Minimize" onClick={() => ipcRenderer.send('minimize')}>
                        —
                    </button>
                    <button id="close" title="Close" onClick={() => ipcRenderer.send('quit')}>
                        &#x2715;
                    </button>
                </div>
                <Drawer
                    variant="permanent"
                    className={this.state.drawerOpen ? 'drawer' : 'drawer drawerClose'}
                    classes={{paper: this.state.drawerOpen ? 'drawer' : 'drawer drawerClose'}}
                >
                    <List>
                        <ListItem className="drawerToggleRow" disablePadding>
                            <Tooltip
                                title={this.state.drawerOpen ? 'Collapse navigation' : 'Expand navigation'}
                                placement="right"
                                arrow
                            >
                                <IconButton
                                    aria-label={this.state.drawerOpen ? 'Collapse navigation' : 'Expand navigation'}
                                    aria-expanded={this.state.drawerOpen}
                                    onClick={() => this.toggleDrawer(!this.state.drawerOpen)}
                                    className="drawerToggle"
                                    color="primary"
                                >
                                    {this.state.drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem className={this.state.drawerOpen ? 'logo logoOpen' : 'logo'} disablePadding>
                            <img src={logo} width="181px" />
                        </ListItem>
                        <Divider variant="middle" />
                        <Tooltip title="Dashboard" placement="right" arrow>
                            <ListItemButton key="Dashboard" onClick={() => this.setPage('main')}>
                                <AssessmentIcon color="primary" />
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </Tooltip>
                        <Tooltip title="Table" placement="right" arrow>
                            <ListItemButton key="Table" onClick={() => this.setPage('table')}>
                                <ListAltIcon color="primary" />
                                <ListItemText primary="Table" />
                            </ListItemButton>
                        </Tooltip>
                        <Tooltip title="Quick Scan" placement="right" arrow>
                            <ListItemButton
                                key="Quick Miner Scan"
                                onClick={() => this.portscan(Object.entries(networks)[0][1][0], 24, 500)}
                            >
                                <NetworkCheckIcon color="primary" />
                                <ListItemText primary="Quick Miner Scan" />
                            </ListItemButton>
                        </Tooltip>
                        <Tooltip title="Advanced Scan" placement="right" arrow>
                            <ListItemButton key="Advanced Scan" onClick={() => this.setState({portscan: true})}>
                                <PermScanWifiIcon color="primary" />
                                <ListItemText primary="Advanced Scan" />
                            </ListItemButton>
                        </Tooltip>
                        <Tooltip title="Session Password" placement="right" arrow>
                            <ListItemButton key="Password" onClick={() => this.toggleModal(true)}>
                                <VpnKeyIcon color="primary" />
                                <ListItemText primary="Session Password" />
                            </ListItemButton>
                        </Tooltip>
                        <Tooltip title="Preferences" placement="right" arrow>
                            <ListItemButton key="Preferences" onClick={() => this.setPage('preferences')}>
                                <SettingsIcon color="primary" />
                                <ListItemText primary="Preferences" />
                            </ListItemButton>
                        </Tooltip>
                        <Tooltip title="Support" placement="right" arrow>
                            <ListItemButton key="Support" onClick={() => this.setPage('support')}>
                                <ContactSupportIcon color="primary" />
                                <ListItemText primary="Support" />
                            </ListItemButton>
                        </Tooltip>
                    </List>
                    <div id="version" className={this.state.drawerOpen ? 'logo logoOpen' : 'logo'}>
                        {version}
                    </div>
                </Drawer>
                <Dialog open={this.state.modal} onClose={() => this.toggleModal(false)}>
                    <DialogTitle>Set Session Password</DialogTitle>
                    <DialogContent>
                        Add a session password to be used by default for all settings:
                        <TextField
                            type="password"
                            variant="outlined"
                            margin="dense"
                            label="Session Password"
                            id="sessionPass"
                            onKeyPress={(e) => (e.key == 'Enter' ? this.setSessionPass() : null)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="contained" onClick={() => this.setSessionPass()}>
                            Set Password
                        </Button>
                        <Button color="primary" variant="outlined" onClick={() => this.toggleModal(false)}>
                            Skip
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.portscan} onClose={() => this.setState({portscan: false})}>
                    <DialogTitle>Scan network for miners</DialogTitle>
                    <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="dense"
                            style={{width: prefix16 ? '130px' : '150px'}}
                            label="Network Address"
                            onChange={(e) => this.setScan(e, 'scanIp')}
                            value={this.state.scanIp}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">{prefix16 ? '.0.0/' : '.0/'}</InputAdornment>
                                    ),
                                },

                                htmlInput: {maxLength: prefix16 ? 7 : 11},
                                inputLabel: {shrink: true},
                            }}
                        />
                        <FormControl variant="outlined" margin="dense">
                            <InputLabel htmlFor="ipRange">Prefix</InputLabel>
                            <Select
                                native
                                id="ipRange"
                                label="Prefix"
                                size="small"
                                value={this.state.scanRange}
                                onChange={(e) => this.setScan(e, 'scanRange')}
                            >
                                <option>16</option>
                                <option>22</option>
                                <option>24</option>
                            </Select>
                        </FormControl>
                        <TextField
                            variant="outlined"
                            margin="dense"
                            label="Timeout (ms)"
                            onChange={(e) => this.setScan(e, 'scanTimeout')}
                            value={this.state.scanTimeout}
                            style={{width: '120px', marginRight: 0}}
                        />
                        <br />
                        <Typography
                            variant="overline"
                            color="primary"
                            sx={{
                                display: 'inline',
                            }}
                        >
                            Prefix:{' '}
                        </Typography>
                        <Link
                            underline="always"
                            style={{cursor: 'pointer'}}
                            onClick={() =>
                                ipcRenderer.invoke(
                                    'open-external',
                                    'https://docs.netgate.com/pfsense/en/latest/network/cidr.html',
                                )
                            }
                        >
                            Click for explanation
                        </Link>
                        <br />
                        <Typography
                            variant="overline"
                            color="primary"
                            sx={{
                                display: 'inline',
                            }}
                        >
                            Timeout:{' '}
                        </Typography>
                        If no miners are found, try increasing the timeout.
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() =>
                                this.portscan(this.state.scanIp, this.state.scanRange, this.state.scanTimeout)
                            }
                            color="primary"
                            variant="contained"
                        >
                            Scan
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.eula} fullScreen>
                    <DialogContent>
                        <Eula />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.eula(true)} color="primary" variant="contained">
                            Accept
                        </Button>
                        <Button onClick={() => this.eula(false)} color="primary" variant="outlined">
                            Decline
                        </Button>
                    </DialogActions>
                </Dialog>
                <Notifications />
                <div className={this.state.drawerOpen ? 'main mainShift' : 'main'}>
                    {this.state.page == 'main' && <Dashboard data={this.state.miner_data} theme={this.state.theme} />}
                    <div className="table-page" hidden={this.state.page !== 'table'}>
                        <DataTable
                            saveDefault={this.saveDefault}
                            defaultTable={this.state.defaultTable}
                            defaultTableLoaded={this.state.defaultTableLoaded}
                            data={this.state.miner_data}
                            models={this.state.models}
                            tunecap={this.state.tunecap}
                            sessionPass={this.state.sessionPass}
                            addMiner={this.addMiner}
                            delMiner={this.delMiner}
                            blacklist={this.blacklist}
                            saveMiners={this.saveMiners}
                            loadMiners={this.loadMiners}
                            notify={notify}
                            handleApi={this.handleApi}
                            handleFormApi={this.handleFormApi}
                            drawerOpen={this.state.drawerOpen}
                            clear={this.clearUndefined}
                        />
                    </div>
                    {this.state.page == 'preferences' && (
                        <Preferences
                            settings={{
                                sessionpass: this.state.sessionpass,
                                drawer: this.state.drawer,
                                autoload: this.state.autoload,
                                autoscan: this.state.autoscan,
                                theme: this.state.theme,
                            }}
                            savePreferences={this.savePreferences}
                        />
                    )}
                    {this.state.page == 'support' && <Support data={this.state} setPage={this.setPage} />}
                </div>
            </ThemeProvider>
        );
    }
}

const rootElement = document.getElementById('react');
if (rootElement) {
    createRoot(rootElement).render(
        <RendererErrorBoundary>
            <App />
        </RendererErrorBoundary>,
    );
}
