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
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import MenuIcon from '@material-ui/icons/Menu';
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
            },
        },
    },
});

const miners = [];
const blacklist = [];
let app_path = '';
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
        process.exit(1);
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
            drawerOpen: true,
            page: 'main',
            miner_data: [],
            models: [],
            portscan: false,
            modal: false,
            eula: false,
            theme: 'light',
            scanIp: '',
            scanRange: '16',
            scanTimeout: '200',
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
            autoClose: 30000,
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

    componentDidMount() {
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

        fs.readFile(path.join(app_path, 'settings.json'), (err, data) => {
            if (err) {
                this.setState({eula: true});
            } else {
                const settings = JSON.parse(data);
                this.setState(Object.assign(this.state, settings, {scanIp: networks[Object.keys(networks)[0]][0]}));

                if (settings.sessionpass) {
                    this.toggleModal(true);
                }
                if (settings.autoload) {
                    this.loadMiners();
                }

                this.summary(true);
                setInterval(() => this.summary(false), 6000);
            }
        });
    }

    eula(bool) {
        if (bool) {
            this.setState({eula: false});
            this.savePreferences({theme: 'light', sessionpass: true, autoload: false}, false);
        } else {
            process.exit(1);
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

    savePreferences(json, notif) {
        if (json.theme !== this.state.theme) this.toggleTheme();
        if (json.sessionpass !== this.state.sessionpass) this.setState({sessionpass: json.sessionpass});
        if (json.autoload !== this.state.autoload) this.setState({autoload: json.autoload});

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
        var obj;
        var msg;
        switch (api) {
            case '/coin':
                obj = {
                    param: {
                        coin: data.coin,
                        pool_url: data.pool,
                        login: data.address + '.' + data.worker,
                        password: data.wallet_pass,
                    },
                    password: data.password,
                };
                msg = 'Updating coin';
                break;
            case '/pool':
                obj = {param: data.pool, password: data.password};
                break;
            case '/login':
                obj = {
                    param: {login: data.address + '.' + data.worker, password: data.wallet_pass},
                    password: data.password,
                };
                break;
            case '/mode':
                obj = {param: data.mode, password: data.password};
                msg = 'Updating operating mode';
                break;
            case '/id':
                obj = {param: data.checked, password: data.password};
                break;
            case '/password':
                obj = {param: data.pass1, password: data.password};
                break;
            case '/softreboot':
            case '/reboot':
                obj = {param: data.delay, password: data.password};
                break;
            case '/hwconfig':
                obj = {param: true, password: data.password};
                break;
            case '/identify':
                obj = {param: data.checked, password: data.password};
                break;
            case '/miner':
                obj = {param: data.cmd, password: data.password};
                msg = 'Sending command';
                break;
            case '/fanspeed':
                obj = {param: data.speed.toString(), password: data.password};
                break;
            case '/power':
                obj = {param: data.power, password: data.password};
                break;
            case '/test':
                obj = {param: {test: data.test, miner_type: data.type}, password: data.password};
                msg = `Running debug test: ${data.test}`;
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
                            temp[ind].sum = 'reboot';
                            temp[ind].timer = 10; //10 * 6sec = 1min
                            this.setState({miner_data: temp});
                        }
                    }

                    const {body} = await got.post(`http://${miners[i].address}:4028${api}`, {
                        json: obj,
                        timeout: slow_api ? (api === '/test' ? (data.test !== 'Ft4' ? 220000 : 1000000) : 60000) : 5000,
                        responseType: 'json',
                    });

                    if (slow_api) toast.dismiss(i);

                    if (body.result) {
                        notify('success', `${miners[i].address}: ${api.slice(1)} successful`);

                        if (api == '/reboot' || soft_reboot) {
                            let ind = this.state.miner_data.findIndex((a) => a.ip == miners[i].address);
                            var temp = Array.from(this.state.miner_data);
                            temp[ind].sum = 'reboot';
                            temp[ind].timer = 10;
                            this.setState({miner_data: temp});
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
                        <ListItem button key="Dashboard" onClick={() => this.setPage('main')}>
                            <AssessmentIcon />
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button key="Table" onClick={() => this.setPage('table')}>
                            <ListAltIcon />
                            <ListItemText primary="Table" />
                        </ListItem>
                        <ListItem button key="Scan for Miners" onClick={() => this.setState({portscan: true})}>
                            <PermScanWifiIcon />
                            <ListItemText primary="Scan for Miners" />
                        </ListItem>
                        <ListItem button key="Password" onClick={() => this.toggleModal(true)}>
                            <VpnKeyIcon />
                            <ListItemText primary="Session Password" />
                        </ListItem>
                        <ListItem button key="Preferences" onClick={() => this.setPage('preferences')}>
                            <SettingsIcon />
                            <ListItemText primary="Preferences" />
                        </ListItem>
                        <ListItem button key="Support" onClick={() => this.setPage('support')}>
                            <ContactSupportIcon />
                            <ListItemText primary="Support" />
                        </ListItem>
                    </List>
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
                            label="IP Address"
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
                                <option>16</option>
                                <option>24</option>
                            </Select>
                        </FormControl>
                        <TextField
                            variant="outlined"
                            margin="dense"
                            label="Timeout"
                            onChange={(e) => this.setScan(e, 'scanTimeout')}
                            value={this.state.scanTimeout}
                            style={{width: '100px'}}
                        />
                        <br />
                        IP Range: Use 24 for yourip.yourip.yourip.0-255, and 16 for yourip.yourip.0-255.0-255 Timeout:
                        If no miners are found, try increasing the timeout
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
                        />
                    </div>
                    {this.state.page == 'preferences' && (
                        <Preferences
                            settings={{
                                sessionpass: this.state.sessionpass,
                                autoload: this.state.autoload,
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
