const { ipcRenderer, app } = require('electron');
const got = require('got');
const mdns = require('node-dns-sd');
const path = require('path');
const fs = require('fs');
// const NetworkSpeed = require('network-speed');
// const testNetworkSpeed = new NetworkSpeed();
const { createLogger, transports } = require('winston');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dashboard } from './dashboard.jsx';
import { DataTable } from './table.jsx';
import { Support } from './support.jsx';

import { Drawer, ListItem, ListItemText, Button, List, Divider,
        Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CssBaseline, TextField
    } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import './app.css';
import logo from './img/EpicLogo.png'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const light = createMuiTheme({
    palette: {
        primary: {main: '#1b1d4d'},
        secondary: {main: '#ffc107'}
    },
    overrides: {
        MuiCssBaseline: {
            "@global": {
                ".datatable-wrap": {
                    background: "#fafafa"
                },
                ".resizer": {
                    border: "8px solid #fafafa",
                    background: "#aaa",
                    "&.isResizing": {
                      background: "#1b1d4d"
                    }
                },
                ".MuiTableRow-root": {
                    "&.MuiTableRow-head:hover": {
                      backgroundColor: "inherit"
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)"
                    }
                },
                ".MuiTableRow-root.Mui-selected": {
                    backgroundColor: "rgba(27, 29, 77, 0.08) !important",
                    "&:hover": {
                      backgroundColor: "rgba(27, 29, 77, 0.12) !important"
                    }
                },
                ".grid": {
                    borderBottom: "1px solid rgba(0, 0, 0, 0.12)"
                }
            }
        }
    }
})

const dark = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {main: '#ffc107'},
        secondary: {main: '#1b1d4d'}
    },
    overrides: {
        MuiCssBaseline: {
          "@global": {
            "*::-webkit-scrollbar": {
              width: "1.25em",
              height: "1.25em",
              background: "#202022"
            },
            "*::-webkit-scrollbar-corner": {
              background: "#202022"
            },
            "*::-webkit-scrollbar-thumb": {
              background: "#585859",
              border: "3px solid #202022",
              borderRadius: "8px"
            },
            "*::-webkit-scrollbar-thumb:hover": {
              background: "#999"
            },
            ".datatable-wrap": {
                background: "#303030"
            },
            ".resizer": {
              border: "8px solid #303030",
              background: "#aaa",
              "&.isResizing": {
                background: "#ffc107"
              }
            },
            ".MuiTableRow-root": {
              "&.MuiTableRow-head:hover": {
                backgroundColor: "inherit"
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)"
              }
            },
            ".MuiTableRow-root.Mui-selected": {
              backgroundColor: "rgba(255, 193, 7, 0.16) !important",
              "&:hover": {
                backgroundColor: "rgba(255, 193, 7, 0.24) !important"
              }
            },
            ".grid": {
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)"
            }
          }
        }
    }
})

var miners = [];
var blacklist = [];
var app_path = '';

switch (process.platform) {
    case "darwin":
        app_path = path.join(process.env.HOME, "Library", "Application Support", "ePIC-Dashboard");
        break;
    case "win32":
        app_path = path.join(process.env.APPDATA, "ePIC-Dashboard");
        break;
    case "linux":
        app_path = path.join(process.env.HOME, ".ePIC-Dashboard");
        break;
    default:
        console.log("Unsupported platform: " + process.platform);
        process.exit(1);
}

const logger = createLogger({
    transports: [
        new transports.File({ filename: path.join('combined.log') })
    ],
    exceptionHandlers: [
        new transports.File({ filename: path.join(app_path, 'errors.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join(app_path, 'errors.log') })
    ]
});

fs.readFile(path.join(app_path, 'blacklist.txt'), (err, data) => {
    if (err) {
        console.log('blacklist.txt not found');
        return;
    }
    blacklist = data.toString().split('\n');
    console.log(blacklist);
});

const notify = (sev, text, options) => {
    toast(({ closeToast }) => (
        <Alert elevation={6} variant="filled" onClose={closeToast} severity={sev}>
            {text}
        </Alert>
    ), options);
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerOpen: true,
            page: 'main',
            miner_data: [],
            models: [],
            modal: false,
            modal2: false,
            theme: 'light'
        };

        this.addMiner = this.addMiner.bind(this);
        this.delMiner = this.delMiner.bind(this);
        this.saveMiners = this.saveMiners.bind(this);
        this.loadMiners = this.loadMiners.bind(this);
        this.blacklist = this.blacklist.bind(this);
        this.handleApi = this.handleApi.bind(this);
        this.handleFormApi = this.handleFormApi.bind(this);
    }

    async summary(init) {     
        let models = new Set(this.state.models);
        let miner_data = await Promise.all(
            miners.map(async miner => {
                try {
                    const summary = await got(`http://${miner.address}:${miner.service.port}/summary`, {
                        timeout: 1500, retry: 0
                    });

                    let match = this.state.miner_data.find(a => a.ip == miner.address);

                    if (init || !match || match.sum == 'load' || match.sum == 'reboot' || match.sum == null) {
                        const history = await got(`http://${miner.address}:${miner.service.port}/history`, {
                            timeout: 1500, retry: 0
                        });
                        try {
                            const cap = await got(`http://${miner.address}:${miner.service.port}/capabilities`, {
                                timeout: 1000, retry: 0
                            });
                            let content = JSON.parse(cap.body);
                            
                            if (content.Model) models.add(content.Model);
                            else models.add('undefined');

                            return {
                                ip: miner.address,
                                sum: JSON.parse(summary.body),
                                hist: JSON.parse(history.body).History.slice(-48),
                                cap: content.Model ? content : null,
                                timer: 0
                            };
                        } catch(err) {
                            console.log(err);
                            models.add('undefined');
                            return {ip: miner.address, sum: JSON.parse(summary.body), hist: JSON.parse(history.body).History.slice(-48), cap: null};
                        }
                    } else {
                        const lastMHs = JSON.parse(summary.body).Session.LastAverageMHs;

                        if (lastMHs == null) {
                            return {ip: miner.address, sum: JSON.parse(summary.body), hist: [], cap: match.cap};
                        } else if (match.hist.length == 0) {
                            return {ip: miner.address, sum: JSON.parse(summary.body), hist: [lastMHs], cap: match.cap};
                        } else if (!match.hist.map(a => a.Timestamp).includes(lastMHs.Timestamp)) {
                            if (match.hist.length >= 48)
                                match.hist.slice(1);
                            match.hist.push(lastMHs);
                            return {ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist, cap: match.cap};
                        } else {
                            return {ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist, cap: match.cap};
                        }
                    }
                } catch(err) {
                    let match = this.state.miner_data.find(a => a.ip == miner.address);

                    if (match && match.sum == 'reboot' && match.timer > 0) {
                        return {ip: miner.address, sum: 'reboot', hist: 'reboot', cap: match.cap, timer: match.timer - 1};
                    } else {
                        models.add('undefined');
                        return {ip: miner.address, sum: null, hist: null, timer: 0};
                    }
                }
            })
        );
        
        models = Array.from(models).sort();
        if (models.length != this.state.models.length) this.setState({miner_data: miner_data, models: models});
        else this.setState({miner_data: miner_data});
    }

    compare(a, b) {
        if (a.address > b.address) return 1;
        else if (a.address < b.address) return -1;
        else return 0;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.miner_data != this.state.miner_data) {
            mdns.discover({
                name: '_epicminer._tcp.local', wait: 2
            }).then((list) => {
                list = list.filter(a => !blacklist.includes(a.fqdn));
                let prev = miners.map(a => a.address);
                for (let miner of list) {
                    if (!prev.includes(miner.address)) miners.push(miner);
                }
                
                setTimeout(() => {
                    this.summary(false);
                    console.log('update');
                }, 3000);
            }).catch(err => {
                console.log(err);
            });
        }
    }

    componentDidMount() {
        ipcRenderer.on('form-post-reply', (event, i, sev, text) => {
            notify(sev, text, {
                autoClose: 600000, //10 min
                hideProgressBar: false,
                pauseOnHover: false,
                toastId: i
            });
            
            let ind = this.state.miner_data.findIndex(a => a.ip == miners[i].address);
            var temp = this.state.miner_data;
            temp[ind].sum = 'reboot';
            temp[ind].timer = 100; // 100 * 6sec = 10min
            this.setState({miner_data: temp});
        });

        ipcRenderer.on('form-result', (event, i, sev, text) => {
            notify(sev, text);
            toast.dismiss(i);
        });

        /*(const options = {
            hostname: '10.10.0.216',
            port: 4000,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const start = Date.now();
        testNetworkSpeed.checkUploadSpeed(options, 100000).then(result => {
            console.log(result);
            console.log(Date.now() - start);
        });*/
        
        mdns.discover({
            name: '_epicminer._tcp.local', wait: 2
        }).then((list) => {
            list = list.filter(a => !blacklist.includes(a.fqdn));

            if (!list.length) {
                this.toggleModal(true);
            } else {
                console.log(list);
                miners = list.sort(this.compare);
            }
            this.setState({modal2: true})

            this.summary(true);
            console.log('mounted');
        });
    }

    toggleDrawer(open) {
        this.setState({drawerOpen: open});
    };

    toggleModal(open) {
        this.setState({modal: open});
    }

    setPage(page) {
        this.setState({page: page});
    }

    setSessionPass() {
        notify('success', 'Session password set');
        this.setState({sessionPass: document.getElementById('sessionPass').value, modal2: false});
    }

    toggleTheme() {
        this.setState({theme: this.state.theme == 'light' ? 'dark' : 'light'});
    }

    addMiner(ip) {
        let prev = miners.map(a => a.address);
        if (!prev.includes(ip)) {
            miners.push({address: ip, service: {port: 4028}});

            var temp = this.state.miner_data;
            temp.push({ip: ip, sum: 'load', hist: 'load'});
        
            var models = Array.from(this.state.models);
            if (!models.includes('undefined')) models.push('undefined');

            notify('success', `Successfully added ${ip}`);
            this.setState({models: models, miner_data: temp});
        } else {
            notify('info', `${ip} already tracked`);
        }
    }

    delMiner(ids) {
        var temp = this.state.miner_data;
        for (let id of ids.sort(function(a, b){return b-a})) {
            miners.splice(id, 1);
            temp.splice(id, 1);
        }

        console.log(miners);
        notify('success', 'Successfully removed miners');
        this.setState({miner_data: temp});
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
            const prev = miners.map(a => a.address);
            for (let ip of ips) {
                if (ip && !prev.includes(ip)) miners.push({address: ip, service: {port: 4028}});
            }

            notify('success', 'Successfully loaded miners');
        });
    }

    blacklist(ids) {
        var temp = this.state.miner_data;
        for (let id of ids.sort(function(a, b){return b-a})) {
            blacklist.push(miners[id].fqdn);
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
        switch(api) {
            case '/coin':
                obj = {
                    param: {
                        coin: data.coin,
                        pool_url: data.pool,
                        login: data.address + '.' + data.worker,
                        password: data.wallet_pass
                    },
                    password: data.password
                };
                msg = 'Updating coin';
                break;
            case '/pool':
                obj = {param: data.pool, password: data.password};
                break;
            case '/login':
                obj = {
                    param: {login: data.address + '.' + data.worker, password: data.wallet_pass},
                    password: data.password
                };
                break;
            case '/mode':
                obj = {param: data.mode, password: data.password};
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
                msg = 'Sending command'
                break;
            case '/fanspeed':
                obj = {param: data.speed.toString(), password: data.password};
        }
        
        let slow_api = api == '/coin' || api == '/miner'; //sends response after completed
        let soft_reboot = api == '/softreboot' || api == 'hwconfig' || api == '/mode'; //sends response early

        for (let i of selected) {
            (async () => {
            try {
                if (slow_api) {
                    notify('info', `${miners[i].address}: ${msg}`, {
                        autoClose: 60000,
                        hideProgressBar: false,
                        pauseOnHover: false,
                        toastId: i
                    });

                    let ind = this.state.miner_data.findIndex(a => a.ip == miners[i].address);
                    var temp = this.state.miner_data;
                    temp[ind].sum = 'reboot';
                    temp[ind].timer = 10; //10 * 6sec = 1min
                    this.setState({miner_data: temp});
                }

                const {body} = await got.post(`http://${miners[i].address}:${miners[i].service.port}${api}`, {
                    json: obj,
                    timeout: slow_api ? 60000 : 5000,
                    responseType: 'json'
                });
                
                if (slow_api) toast.dismiss(i);

                if (body.result) {
                    notify('success', `${miners[i].address}: ${api} successful`);
                    
                    if (api == '/reboot' || soft_reboot) {
                        let ind = this.state.miner_data.findIndex(a => a.ip == miners[i].address);
                        var temp = this.state.miner_data;
                        temp[ind].sum = 'reboot';
                        temp[ind].timer = 10;
                        this.setState({miner_data: temp});
                    }
                } else {
                    notify('error', `${miners[i].address}: ${body.error}`);
                }
            } catch(err) {
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
                <CssBaseline/>
                <Button onClick={() => this.toggleDrawer(true)} variant="contained" color="primary" id="menu-but">
                    <MenuOpenIcon color="secondary"/>
                </Button>
                <Drawer open={this.state.drawerOpen} onClose={() => this.toggleDrawer(false)}>
                    <div onClick={() => this.toggleDrawer(false)}>
                        <List>
                            <ListItem>
                                <img src={logo}/>
                            </ListItem>
                            <Divider variant="middle" light/>
                            <ListItem button onClick={() => this.toggleTheme()}>
                                <InvertColorsIcon/>
                                <ListItemText primary="Toggle Theme"/>
                            </ListItem>
                            <Divider variant="middle"/>
                            <ListItem button key="Dashboard" onClick={() => this.setPage('main')}>
                                <AssessmentIcon/>
                                <ListItemText primary="Dashboard"/>
                            </ListItem>
                            <ListItem button key="Table" onClick={() => this.setPage('table')}>
                                <ListAltIcon/>
                                <ListItemText primary="Table"/>
                            </ListItem>
                            <ListItem button key="Password" onClick={() => this.setState({modal2: true})}>
                                <VpnKeyIcon/>
                                <ListItemText primary="Session Password"/>
                            </ListItem>
                            <ListItem button key="Support" onClick={() => this.setPage('support')}>
                                <ContactSupportIcon/>
                                <ListItemText primary="Support"/>
                            </ListItem>
                        </List>
                    </div>
                </Drawer>
                <Dialog open={this.state.modal} onClose={() => this.toggleModal(false)}>
                    <DialogTitle>No Miners found</DialogTitle>
                    <DialogContent>
                        If you are connecting over a VPN, this software will not detect your miners.
                        You must manually add miners by IP in the Miner List tab.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                                    this.toggleModal(false);
                                    this.setPage('table');
                                }} color="primary" variant="contained">
                            Navigate to List
                        </Button>
                        <Button onClick={() => this.toggleModal(false)} color="primary" variant="outlined">
                            Dismiss
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.modal2} onClose={() => this.setState({modal2: false})}>
                    <DialogTitle>Set Session Password</DialogTitle>
                    <DialogContent>
                        Add a session password to be used by default for all settings:
                        <TextField type="password" variant="outlined" margin="dense" label="Session Password" id="sessionPass"
                            onKeyPress={(e) => e.key == 'Enter' ? this.setSessionPass() : null}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setSessionPass()} color="primary" variant="contained">Set Password</Button>
                        <Button onClick={() => this.setState({modal2: false})} color="primary" variant="outlined">Skip</Button>
                    </DialogActions>
                </Dialog>
                <ToastContainer
                    position='top-right'
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    draggable={false}
                    closeButton={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                />
                { this.state.page == 'main' && <Dashboard data={this.state.miner_data} theme={this.state.theme}/> }
                { this.state.page == 'table' &&
                    <DataTable data={this.state.miner_data} models={this.state.models} sessionPass={this.state.sessionPass}
                        addMiner={this.addMiner} delMiner={this.delMiner} blacklist={this.blacklist}
                        saveMiners={this.saveMiners} loadMiners={this.loadMiners}
                        handleApi={this.handleApi} handleFormApi={this.handleFormApi}
                    />
                }
                { this.state.page == 'support' && <Support data={this.state}/> }
            </MuiThemeProvider>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("react"));
