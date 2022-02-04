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
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import MenuIcon from '@material-ui/icons/Menu';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import PermScanWifiIcon from '@material-ui/icons/PermScanWifi';
import SettingsIcon from '@material-ui/icons/Settings';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import './app.css';
import logo from './img/EpicLogo.png';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';

const light = createMuiTheme({
    palette: {
        primary: {main: '#1b1d4d'},
        secondary: {main: '#ffc107'},
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                '.datatable-wrap': {
                    background: '#fafafa',
                },
                '.resizer': {
                    border: '8px solid #fafafa',
                    background: '#aaa',
                    '&.isResizing': {
                        background: '#1b1d4d',
                    },
                },
                '.MuiTableRow-root': {
                    '&.MuiTableRow-head:hover': {
                        backgroundColor: 'inherit',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                },
                '.MuiTableRow-root.Mui-selected': {
                    backgroundColor: 'rgba(27, 29, 77, 0.08) !important',
                    '&:hover': {
                        backgroundColor: 'rgba(27, 29, 77, 0.12) !important',
                    },
                },
                '.grid': {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                },
                '.MuiDrawer-root .MuiListItem-button:hover': {
                    background: 'rgba(255, 255, 255, 0.08)',
                },
                '.unique-id-label': {
                    color: 'rgba(0, 0, 0, 0.54)',
                },
            },
        },
    },
});

const dark = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {main: '#ffc107'},
        secondary: {main: '#1b1d4d'},
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                '*::-webkit-scrollbar': {
                    width: '1.25em',
                    height: '1.25em',
                    background: '#202022',
                },
                '*::-webkit-scrollbar-corner': {
                    background: '#202022',
                },
                '*::-webkit-scrollbar-thumb': {
                    background: '#585859',
                    border: '3px solid #202022',
                    borderRadius: '8px',
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    background: '#999',
                },
                '.datatable-wrap': {
                    background: '#303030',
                },
                '.resizer': {
                    border: '8px solid #303030',
                    background: '#aaa',
                    '&.isResizing': {
                        background: '#ffc107',
                    },
                },
                '.MuiTableRow-root': {
                    '&.MuiTableRow-head:hover': {
                        backgroundColor: 'inherit',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                },
                '.MuiTableRow-root.Mui-selected': {
                    backgroundColor: 'rgba(255, 193, 7, 0.16) !important',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 193, 7, 0.24) !important',
                    },
                },
                '.grid': {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                },
                '.unique-id-label': {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
            },
        },
    },
});

const miners = [];
const blacklist = [];
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

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerOpen: false,
            page: 'main',
            miner_data: [],
            models: [],
            portscan: false,
            modal: false,
            eula: false,
            theme: 'light',
            scanIp: '',
            scanRange: '24',
            scanTimeout: '500',
        };

        this.setPage = this.setPage.bind(this);
        this.addMiner = this.addMiner.bind(this);
        this.delMiner = this.delMiner.bind(this);
        this.savePreferences = this.savePreferences.bind(this);
        this.saveMiners = this.saveMiners.bind(this);
        this.loadMiners = this.loadMiners.bind(this);
        this.blacklist = this.blacklist.bind(this);
        this.handleApi = this.handleApi.bind(this);
        this.handleFormApi = this.handleFormApi.bind(this);
        this.setScan = this.setScan.bind(this);
        this.clearUndefined = this.clearUndefined.bind(this);
    }

    async summary(init) {
        let models = new Set(this.state.models);
        let miner_data = await Promise.all(
            miners.map(async (miner, i) => {
                try {
                    const summary = await got(`http://${miner.address}:4028/summary`, {
                        timeout: 2000,
                        retry: 0,
                    });

                    let sum = JSON.parse(summary.body);
                    if (!sum.Hostname) sum = null;

                    let match = this.state.miner_data.find((a) => a.ip == miner.address);

                    if (
                        init ||
                        !match ||
                        match.sum == 'load' ||
                        match.sum == 'reboot' ||
                        match.sum == null ||
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

                            return {
                                ip: miner.address,
                                sum: sum,
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
                                hist: JSON.parse(history.body).History.slice(-48),
                                timer: 10,
                            };
                        }
                    } else {
                        const lastMHs = sum.Session.LastAverageMHs;

                        if (lastMHs == null) {
                            return {ip: miner.address, sum: sum, hist: [], cap: match.cap, timer: 10};
                        } else if (match.hist.length == 0) {
                            return {ip: miner.address, sum: sum, hist: [lastMHs], cap: match.cap, timer: 10};
                        } else if (!match.hist.map((a) => a.Timestamp).includes(lastMHs.Timestamp)) {
                            if (match.hist.length >= 48) match.hist.slice(1);
                            match.hist.push(lastMHs);
                        }
                        return {ip: miner.address, sum: sum, hist: match.hist, cap: match.cap, timer: 10};
                    }
                } catch (err) {
                    let match = this.state.miner_data.find((a) => a.ip == miner.address);

                    if (match) {
                        if (match.timer > 0) {
                            return {
                                ip: miner.address,
                                sum: match.sum == 'reboot' ? 'reboot' : null,
                                hist: match.sum == 'reboot' ? 'reboot' : null,
                                cap: match.cap ? match.cap : null,
                                timer: match.timer - 1,
                            };
                        }

                        models.add('undefined');
                        return {ip: miner.address, sum: null, hist: null, timer: 0};
                    } else {
                        models.add('undefined');
                        return {ip: miner.address, sum: null, hist: null, timer: 0};
                    }
                }
            })
        );

        models = Array.from(models).sort();
        miner_data = miner_data.filter((x) => x !== undefined);
        if (models.length != this.state.models.length) this.setState({miner_data: miner_data, models: models});
        else this.setState({miner_data: miner_data});
    }

    compare(a, b) {
        if (a.address > b.address) return 1;
        else if (a.address < b.address) return -1;
        else return 0;
    }

    async portscan(ip, range, timeout) {
        notify('info', 'Scanning for miners...', {
            autoClose: range === '16' ? 30000 + parseInt(timeout) : 2000 + parseInt(timeout),
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
        this.setState(Object.assign(this.state, settings, {scanIp: Object.entries(networks)[0][1][0]}));

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
        this.setState({[key]: e.target.value});
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
            temp.push({ip: ip, sum: 'load', hist: 'load', timer: 0});

            var models = Array.from(this.state.models);
            if (!models.includes('undefined')) models.push('undefined');

            notify('success', `Successfully added ${ip}`);
            this.setState({models: models, miner_data: temp});
        } else {
            notify('info', `${ip} already tracked`);
        }
    }

    delMiner(ids) {
        var temp = Array.from(this.state.miner_data);
        for (let id of ids.sort(function (a, b) {
            return b - a;
        })) {
            miners.splice(id, 1);
            temp.splice(id, 1);
        }

        notify('success', 'Successfully removed miners');
        this.setState({miner_data: temp});
    }

    clearUndefined() {
        var temp = Array.from(this.state.miner_data);
        temp.forEach((miner, i) => {
            if (!miner.sum && !miner.timer) {
                miners.splice(i, 1);
                temp.splice(i, 1);
            }
        });

        notify('success', 'Successfully cleared miners');
        this.setState({miner_data: temp});
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

    blacklist(ids) {
        console.log(ids, miners);
        var temp = Array.from(this.state.miner_data);
        for (let id of ids.sort(function (a, b) {
            return b - a;
        })) {
            blacklist.push(miners[id].name);
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

        notify('success', 'Successfully blacklisted miners');
        this.setState({miner_data: temp});
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
            case '/fanspeed':
                obj = {param: data.speed.toString(), password: data.password};
                success = `Fan speed set to ${data.speed}%`;
                break;
            case '/test':
                obj = {param: {test: data.test, miner_type: data.type}, password: data.password};
                msg = `Running debug test: ${data.test}`;
                success = `${data.test} debug test completed`;
                break;
        }

        let slow_api = api == '/coin' || api == '/miner' || api == '/mode' || api == '/test'; //sends response after completed
        let soft_reboot = api == '/softreboot' || api == '/hwconfig' || api == '/power'; //sends response early

        for (let i of selected) {
            (async () => {
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
                        }
                    } else {
                        notify('error', `${miners[i].address}: ${body.error}`);
                    }
                } catch (err) {
                    console.log(err);
                    notify('error', `${miners[i].address}: Request Failed`);
                }
            })();
        }
    }

    handleFormApi(api, data, selected) {
        ipcRenderer.send('form-post', miners, api, data, selected);
    }

    render() {
        const split = this.state.scanIp.split('.');

        return (
            <MuiThemeProvider theme={this.state.theme == 'light' ? light : dark}>
                <CssBaseline />
                <Button
                    onClick={() => this.toggleDrawer(!this.state.drawerOpen)}
                    variant="contained"
                    color="primary"
                    className={this.state.drawerOpen ? 'menuBut menuButOpen' : 'menuBut'}
                >
                    <MenuIcon color="secondary" />
                </Button>
                <Drawer
                    variant="permanent"
                    className={this.state.drawerOpen ? 'drawer' : 'drawer drawerClose'}
                    classes={{paper: this.state.drawerOpen ? 'drawer' : 'drawer drawerClose'}}
                >
                    <List>
                        <ListItem className={this.state.drawerOpen ? 'logo logoOpen' : 'logo'}>
                            <img src={logo} />
                        </ListItem>
                        <Divider variant="middle" />
                        <Tooltip title="Dashboard" placement="right" arrow>
                            <ListItem button key="Dashboard" onClick={() => this.setPage('main')}>
                                <AssessmentIcon />
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Table" placement="right" arrow>
                            <ListItem button key="Table" onClick={() => this.setPage('table')}>
                                <ListAltIcon />
                                <ListItemText primary="Table" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Quick Scan" placement="right" arrow>
                            <ListItem
                                button
                                key="Quick Miner Scan"
                                onClick={() => this.portscan(Object.entries(networks)[0][1][0], 24, 500)}
                            >
                                <NetworkCheckIcon />
                                <ListItemText primary="Quick Miner Scan" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Advanced Scan" placement="right" arrow>
                            <ListItem button key="Advanced Scan" onClick={() => this.setState({portscan: true})}>
                                <PermScanWifiIcon />
                                <ListItemText primary="Advanced Scan" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Session Password" placement="right" arrow>
                            <ListItem button key="Password" onClick={() => this.toggleModal(true)}>
                                <VpnKeyIcon />
                                <ListItemText primary="Session Password" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Preferences" placement="right" arrow>
                            <ListItem button key="Preferences" onClick={() => this.setPage('preferences')}>
                                <SettingsIcon />
                                <ListItemText primary="Preferences" />
                            </ListItem>
                        </Tooltip>
                        <Tooltip title="Support" placement="right" arrow>
                            <ListItem button key="Support" onClick={() => this.setPage('support')}>
                                <ContactSupportIcon />
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
                        <Button onClick={() => this.setSessionPass()} color="primary" variant="contained">
                            Set Password
                        </Button>
                        <Button onClick={() => this.toggleModal(false)} color="primary" variant="outlined">
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
                            label="Network Address"
                            onChange={(e) => this.setScan(e, 'scanIp')}
                            value={this.state.scanIp}
                        />
                        <FormControl variant="outlined" margin="dense">
                            <InputLabel htmlFor="ipRange">IP Range</InputLabel>
                            <Select
                                native
                                id="ipRange"
                                label="Command"
                                value={this.state.scanRange}
                                onChange={(e) => this.setScan(e, 'scanRange')}
                            >
                                <option value="16">/16</option>
                                <option value="24">/24</option>
                            </Select>
                        </FormControl>
                        <TextField
                            variant="outlined"
                            margin="dense"
                            label="Timeout (ms)"
                            onChange={(e) => this.setScan(e, 'scanTimeout')}
                            value={this.state.scanTimeout}
                            style={{width: '100px'}}
                        />
                        <br />
                        <Typography display="inline" variant="overline" color="primary">
                            IP Range:{' '}
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
                            Explanation
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
                            data={this.state.miner_data}
                            models={this.state.models}
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
            </MuiThemeProvider>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('react'));
