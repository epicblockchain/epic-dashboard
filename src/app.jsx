const {ipcRenderer} = require('electron');
const got = require('got');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {createLogger, transports} = require('winston');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Dashboard} from './dashboard.jsx';
import {DataTable} from './table.jsx';
import {Preferences} from './preferences.jsx';
import {Support} from './support.jsx';
import {Eula} from './eula.jsx';

import {
    Drawer,
    ListItem,
    ListItemText,
    Button,
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
    Alert,
    InputAdornment,
} from '@mui/material';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import MenuIcon from '@mui/icons-material/Menu';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import PermScanWifiIcon from '@mui/icons-material/PermScanWifi';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import './app.css';
import icon from './img/epic.png';
import darkLogo from './img/EpicLogoDark.png';
import lightLogo from './img/EpicLogoLight.png';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {ContactSupportOutlined} from '@mui/icons-material';

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
let lock = false;

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

const logger = createLogger({
    exceptionHandlers: [new transports.File({filename: path.join(app_path, 'errors.log')})],
    rejectionHandlers: [new transports.File({filename: path.join(app_path, 'errors.log')})],
    exitOnError: false,
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

fs.readFile(path.join(app_path, 'blacklist.txt'), (err, data) => {
    if (err) {
        console.log('blacklist.txt not found');
        return;
    }
    blacklist = data.toString().split('\n');
    console.log(blacklist);
});

const notify = (sev, text, options) => {
    toast(
        ({closeToast}) => (
            <Alert elevation={6} variant="filled" onClose={closeToast} severity={sev}>
                {text}
            </Alert>
        ),
        options
    );
};

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
                status: true,
                ip: true,
                name: true,
                firmware: true,
                model: false,
                mode: true,
                pool: true,
                user: true,
                start: false,
                uptime: true,
                hbs: true,
                hbperformance: true,
                hashrate15min: true,
                hashrate1hr: false,
                hashrate6hr: false,
                hashrate24hr: false,
                efficiency1hr: false,
                accepted: false,
                rejected: false,
                difficulty: false,
                temperature: true,
                power: false,
                fanspeed: false,
                voltage: false,
            },
        };

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
    }

    retryPromise(fn, retries = 3) {
        return new Promise((resolve, reject) => {
            fn()
                .then(resolve)
                .catch((error) => {
                    if (retries > 0) {
                        console.log('retry');
                        return retryPromise(fn, retries - 1)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        console.log('error');
                        reject(error);
                    }
                });
        });
    }

    async summary(init) {
        let models = new Set(this.state.models);
        let tunecap = new Set(this.state.tunecap);
        const unlock = await minerMutex.lock();
        let miner_data = await Promise.all(
            miners.map(async (miner, i) => {
                try {
                    const summary = await got(`http://${miner.address}:4028/summary`, {
                        timeout: 2000,
                        retry: 0,
                    });
                    let sum = JSON.parse(summary.body);

                    const network = await got(`http://${miner.address}:4028/network`, {
                        timeout: 2000,
                        retry: 0,
                    });
                    let net = JSON.parse(network.body);
                    if (!sum.Hostname) sum = null;

                    let match = this.state.miner_data.find((a) => a.ip == miner.address);

                    if (
                        init ||
                        !match ||
                        match.sum == 'load' ||
                        match.sum == 'reboot' ||
                        match.sum == null ||
                        match.cap.Model === 'undefined' ||
                        (match && !match.cap)
                    ) {
                        const history = await got(`http://${miner.address}:4028/history`, {
                            timeout: 2000,
                            retry: 0,
                        });
                        try {
                            const cap = await got(`http://${miner.address}:4028/capabilities`, {
                                timeout: 2000,
                                retry: 0,
                            });
                            let content = JSON.parse(cap.body);

                            if (content.Model) models.add(content.Model);
                            else models.add('undefined');

                            if (
                                content.Model &&
                                content.Model != 'undefined' &&
                                content.Display &&
                                content.Display.includes('ClksAndVoltage')
                            )
                                tunecap.add(content.Model.toLowerCase());

                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist: JSON.parse(history.body).History.slice(-48),
                                cap: content.Model ? content : undefined,
                                timer: 10,
                            };
                        } catch (err) {
                            console.log(err);
                            models.add('undefined');
                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist: JSON.parse(history.body).History.slice(-48),
                                timer: 10,
                            };
                        }
                    } else {
                        const lastMHs = sum.Session.LastAverageMHs;

                        if (lastMHs == null) {
                            return {ip: miner.address, sum: sum, hist: [], cap: match.cap, network: net, timer: 10};
                        } else if (match.hist.length == 0) {
                            return {
                                ip: miner.address,
                                sum: sum,
                                network: net,
                                hist: [lastMHs],
                                cap: match.cap,
                                timer: 10,
                            };
                        } else if (!match.hist.map((a) => a.Timestamp).includes(lastMHs.Timestamp)) {
                            if (match.hist.length >= 48) match.hist.slice(1);
                            match.hist.push(lastMHs);
                        }
                        return {
                            ip: miner.address,
                            sum: sum,
                            network: net,
                            hist: match.hist,
                            cap: match.cap,
                            timer: 10,
                        };
                    }
                } catch (err) {
                    let match = this.state.miner_data.find((a) => a.ip == miner.address);

                    if (match) {
                        if (match.timer > 0) {
                            return {
                                ip: miner.address,
                                sum: match.sum ? match.sum : null,
                                network: match.network ? match.network : null,
                                hist: match.sum ? match.hist : null,
                                cap: match.cap ? match.cap : null,
                                timer: match.timer - 1,
                            };
                        }

                        models.add('undefined');
                        return {ip: miner.address, sum: null, hist: null, network: null, timer: 0};
                    } else {
                        models.add('undefined');
                        return {ip: miner.address, sum: null, hist: null, network: null, timer: 0};
                    }
                }
            })
        );

        models = Array.from(models).sort();
        tunecap = Array.from(tunecap).sort();
        miner_data = miner_data.filter((x) => x !== undefined);
        if (tunecap.length != this.state.tunecap.length) this.setState({tunecap: tunecap});
        if (models.length != this.state.models.length)
            this.setState({miner_data: miner_data, models: models}, () => unlock());
        else this.setState({miner_data: miner_data}, () => unlock());
    }

    compare(a, b) {
        if (a.address > b.address) return 1;
        else if (a.address < b.address) return -1;
        else return 0;
    }

    async portscan(ip, range, timeout) {
        notify('info', 'Scanning for miners...', {
            autoClose: range === '16' ? 120000 + parseInt(timeout) : 2000 + parseInt(timeout),
            hideProgressBar: false,
            pauseOnHover: false,
            toastId: 'scan',
        });

        let scan_results = await ipcRenderer.invoke('portscan', ip, range, timeout);
        scan_results = scan_results.filter((a) => !blacklist.includes(a.name));

        let prev = miners.map((a) => a.address);
        for (const obj of scan_results) {
            if (!prev.includes(obj.ip)) {
                miners.push({address: obj.ip, name: obj.name});
            }
        }

        toast.dismiss('scan');
        notify('success', `Scan complete, ${scan_results.length} miner(s) found.`);
    }

    init(settings) {
        const ip = Object.entries(networks)[0][1][0].split('.');
        this.setState(Object.assign(this.state, settings, {scanIp: `${ip[0]}.${ip[1]}.${ip[2]}`}));

        if (settings.sessionpass) this.toggleModal(true);
        if (settings.autoload) this.loadMiners();
        if (settings.drawer !== this.state.drawerOpen) this.setState({drawerOpen: settings.drawer});
        if (settings.autoscan) this.portscan(Object.entries(networks)[0][1][0], 24, 500);

        this.summary(true);
        setInterval(() => this.summary(false), 6000);
    }

    async componentDidMount() {
        ipcRenderer.on('form-post-reply', (event, i, sev, text) => {
            notify(sev, text, {
                autoClose: 600000, //10 min
                hideProgressBar: false,
                pauseOnHover: false,
                toastId: i,
            });

            let ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
            var temp = Array.from(this.state.miner_data);
            temp[ind].sum = 'reboot';
            temp[ind].timer = 100; // 100 * 6sec = 10min
            this.setState({miner_data: temp});
        });

        ipcRenderer.on('form-result', (event, i, sev, text) => {
            notify(sev, text);
            toast.dismiss(i);
        });

        version += await ipcRenderer.invoke('version');

        fs.readFile(path.join(app_path, 'settings.json'), (err, data) => {
            if (err) {
                this.setState({eula: true});
            } else {
                this.init(JSON.parse(data));
            }
        });

        fs.readFile(path.join(app_path, 'default.json'), (err, data) => {
            if (!err) {
                this.setState({defaultTable: JSON.parse(data)});
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
            if (e.target.value === '16') {
                const split = this.state.scanIp.split('.');
                obj.scanIp = `${split[0]}.${split[1]}`;
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
        let prev = miners.map((a) => a.address);
        if (!prev.includes(ip)) {
            miners.push({address: ip});

            var temp = Array.from(this.state.miner_data);
            temp.push({ip: ip, sum: 'load', hist: 'load', network: 'load', timer: 0});

            var models = Array.from(this.state.models);
            if (!models.includes('undefined')) models.push('undefined');

            notify('success', `Successfully added ${ip}`);
            this.setState({models: models, miner_data: temp});
        } else {
            notify('info', `${ip} already tracked`);
        }
    }

    async delMiner(ids) {
        var temp = Array.from(this.state.miner_data);
        for (let id of ids.sort(function (a, b) {
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
        var temp = Array.from(this.state.miner_data);
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
        for (let key of Object.keys(json)) {
            if (json[key] !== this.state[key]) this.setState({[key]: json[key]});
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'settings.json'), JSON.stringify(json), function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
            if (notif) notify('success', 'Preferences saved');
        });
    }

    saveDefault(json) {
        for (let key of Object.keys(json)) {
            if (json[key] !== this.state[key]) this.setState({[key]: json[key]});
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'default.json'), JSON.stringify(json), function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    }

    saveMiners() {
        var string = '';
        for (let miner of miners) {
            string += miner.address + '\n';
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'ipaddr.txt'), string, function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });

        notify('success', 'Successfully saved miners');
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
            for (let ip of ips) {
                if (ip && !prev.includes(ip)) miners.push({address: ip});
            }

            notify('success', 'Successfully loaded miners');
        });
    }

    async blacklist(ids) {
        var temp = Array.from(this.state.miner_data);
        for (let id of ids.sort(function (a, b) {
            return b - a;
        })) {
            blacklist.push(miners[id].name || (temp[id].sum ? temp[id].sum.Hostname : null));
            miners.splice(id, 1);
            temp.splice(id, 1);
        }

        fs.mkdir(app_path, {recursive: true}, (err) => console.log(err));
        fs.writeFile(path.join(app_path, 'blacklist.txt'), blacklist.join('\n'), function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });

        const unlock = await minerMutex.lock();
        notify('success', 'Successfully blacklisted miners');
        this.setState({miner_data: temp}, () => unlock());
    }

    async handleApi(api, data, selected) {
        var obj, msg, success;
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
            case '/mode':
                let param = data.power ? {preset: data.mode, power_target: data.power} : data.mode;
                obj = {param: param, password: data.password};
                msg = 'Updating operating mode';
                success = `Operating mode set to ${data.mode} ${data.power ? `@ ${data.power}W` : ''}`;
                break;
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
                obj = {param: data.load, password: data.password};
                success = `Idle on connection lost set to ${data.load}`;
                break;
        }

        let slow_api = api == '/coin' || api == '/miner' || api == '/mode' || api == '/test' || api == '/wifi'; //sends response after completed
        let soft_reboot = api == '/softreboot' || api == '/hwconfig' || api == '/power'; //sends response early

        const MAX_CONCURRENT_REQUESTS = 5;
        let promises = [];
        for (let i of selected) {
            let promise = this.retryPromise(async () => {
                try {
                    if (slow_api) {
                        notify('info', `${miners[i].address}: ${msg}`, {
                            autoClose: api === '/test' ? (data.test !== 'Ft4' ? 220000 : 1000000) : 60000,
                            hideProgressBar: false,
                            pauseOnHover: false,
                            toastId: i,
                        });

                        if (api !== '/test') {
                            let ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                            var temp = Array.from(this.state.miner_data);
                            if (!temp[ind].sum.Status) {
                                temp[ind].sum = 'reboot';
                                temp[ind].timer = 10; //10 * 6sec = 1min
                                this.setState({miner_data: temp});
                            }
                        }
                    }

                    const {body} = await got.post(`http://${miners[i].address}:4028${api}`, {
                        json: obj,
                        timeout: slow_api ? (api === '/test' ? (data.test !== 'Ft4' ? 220000 : 1000000) : 60000) : 5000,
                        responseType: 'json',
                    });

                    if (slow_api) toast.dismiss(i);

                    if (body.result) {
                        notify('success', `${miners[i].address}: ${success}`);

                        if (api == '/reboot' || soft_reboot) {
                            let ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                            var temp = Array.from(this.state.miner_data);
                            if (!temp[ind].sum.Status) {
                                temp[ind].sum = 'reboot';
                                temp[ind].timer = 10; //10 * 6sec = 1min
                                this.setState({miner_data: temp});
                            }
                        } else if (api === '/identify') {
                            try {
                                let ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                                const summary = await got(`http://${miners[i].address}:4028/summary`, {
                                    timeout: 2000,
                                    retry: 0,
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
                    } else {
                        notify('error', `${miners[i].address}: ${body.error}`);
                    }
                } catch (err) {
                    console.log(err);
                }
            });
            promises.push(promise);
            if (promises.length >= MAX_CONCURRENT_REQUESTS) {
                await Promise.all(promises);
                promises = [];
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    handleFormApi(api, data, selected) {
        ipcRenderer.send('form-post', miners, api, data, selected);
    }

    render() {
        const prefix16 = this.state.scanRange === '16';
        if (this.state.theme === 'light') {
            var logo = lightLogo;
        } else {
            var logo = darkLogo;
        }

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
                <Button
                    onClick={() => this.toggleDrawer(!this.state.drawerOpen)}
                    variant="contained"
                    color="primary"
                    className={this.state.drawerOpen ? 'menuBut menuButOpen' : 'menuBut'}
                >
                    <MenuIcon />
                </Button>
                <Drawer
                    variant="permanent"
                    className={this.state.drawerOpen ? 'drawer' : 'drawer drawerClose'}
                    classes={{paper: this.state.drawerOpen ? 'drawer' : 'drawer drawerClose'}}
                >
                    <List>
                        <ListItem className={this.state.drawerOpen ? 'logo logoOpen' : 'logo'}>
                            <img src={logo} width="181px" />
                        </ListItem>
                        <Divider variant="middle" />
                        <Tooltip title="Dashboard" placement="right" arrow>
                            <ListItem button key="Dashboard" onClick={() => this.setPage('main')}>
                                <AssessmentIcon color="primary" />
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Table" placement="right" arrow>
                            <ListItem button key="Table" onClick={() => this.setPage('table')}>
                                <ListAltIcon color="primary" />
                                <ListItemText primary="Table" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Quick Scan" placement="right" arrow>
                            <ListItem
                                button
                                key="Quick Miner Scan"
                                onClick={() => this.portscan(Object.entries(networks)[0][1][0], 24, 500)}
                            >
                                <NetworkCheckIcon color="primary" />
                                <ListItemText primary="Quick Miner Scan" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Advanced Scan" placement="right" arrow>
                            <ListItem button key="Advanced Scan" onClick={() => this.setState({portscan: true})}>
                                <PermScanWifiIcon color="primary" />
                                <ListItemText primary="Advanced Scan" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Session Password" placement="right" arrow>
                            <ListItem button key="Password" onClick={() => this.toggleModal(true)}>
                                <VpnKeyIcon color="primary" />
                                <ListItemText primary="Session Password" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Preferences" placement="right" arrow>
                            <ListItem button key="Preferences" onClick={() => this.setPage('preferences')}>
                                <SettingsIcon color="primary" />
                                <ListItemText primary="Preferences" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Support" placement="right" arrow>
                            <ListItem button key="Support" onClick={() => this.setPage('support')}>
                                <ContactSupportIcon color="primary" />
                                <ListItemText primary="Support" />
                            </ListItem>
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
                            inputProps={{maxLength: prefix16 ? 7 : 11}}
                            InputLabelProps={{shrink: true}}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">{prefix16 ? '.0.0/' : '.0/'}</InputAdornment>
                                ),
                            }}
                        />
                        <FormControl variant="outlined" margin="dense">
                            <InputLabel htmlFor="ipRange">Prefix</InputLabel>
                            <Select
                                native
                                id="ipRange"
                                label="Command"
                                size="small"
                                value={this.state.scanRange}
                                onChange={(e) => this.setScan(e, 'scanRange')}
                            >
                                <option>16</option>
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
                        <Typography display="inline" variant="overline" color="primary">
                            Prefix:{' '}
                        </Typography>
                        <Link
                            underline="always"
                            style={{cursor: 'pointer'}}
                            onClick={() =>
                                ipcRenderer.invoke(
                                    'open-external',
                                    'https://docs.netgate.com/pfsense/en/latest/network/cidr.html'
                                )
                            }
                        >
                            Click for explanation
                        </Link>
                        <br />
                        <Typography display="inline" variant="overline" color="primary">
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
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    draggable={false}
                    closeButton={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                />
                <div className={this.state.drawerOpen ? 'main mainShift' : 'main'}>
                    {this.state.page == 'main' && <Dashboard data={this.state.miner_data} theme={this.state.theme} />}
                    <div hidden={this.state.page !== 'table'}>
                        <DataTable
                            saveDefault={this.saveDefault}
                            defaultTable={this.state.defaultTable}
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

ReactDOM.render(<App />, document.getElementById('react'));
