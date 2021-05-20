const { ipcRenderer } = require('electron');
const got = require('got');
const mdns = require('node-dns-sd');
const path = require('path');
const fs = require('fs');

var sha256 = require('sha256-file');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dashboard } from './dashboard.jsx';
import { DataTable } from './table.jsx';
import { Support } from './support.jsx';

import { Drawer, ListItem, ListItemIcon, ListItemText, Button, List, Divider,
        Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
    } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import './app.css';

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

fs.readFile(path.join(app_path, 'blacklist.txt'), (err, data) => {
    if (err) {
        console.log('blacklist.txt not found');
        return;
    }
    blacklist = data.toString().split('\n');
    console.log(blacklist);
});

const notify = (sev, text) => {
    toast(({ closeToast }) => (
        <Alert elevation={6} variant="filled" onClose={closeToast} severity={sev}>
            {text}
        </Alert>
    ));
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerOpen: true,
            page: 'main',
            miner_data: [],
            modal: false
        };

        this.addMiner = this.addMiner.bind(this);
        this.delMiner = this.delMiner.bind(this);
        this.blacklist = this.blacklist.bind(this);
        this.handleApi = this.handleApi.bind(this);
        this.handleFormApi = this.handleFormApi.bind(this);
    }

    async summary(init) {
        var miner_data = [];
        
        for (let miner of miners) {
            try {
                const summary = await got(`http://${miner.address}:${miner.service.port}/summary`, {
                    timeout: 1000
                });
                
                if (init) {
                    const history = await got(`http://${miner.address}:${miner.service.port}/history`, {
                        timeout: 1000
                    });
                    try {
                        const cap = await got(`http://${miner.address}:${miner.service.port}/capabilities`, {
                            timeout: 1000
                        });
                        let content = JSON.parse(cap.body);

                        miner_data.push({
                            ip: miner.address,
                            sum: JSON.parse(summary.body),
                            hist: JSON.parse(history.body).History,
                            cap: content.Model ? content : null
                        });
                    } catch(err) {
                        console.log(err);
                    }
                } else {
                    const lastMHs = JSON.parse(summary.body).Session.LastAverageMHs;
                    let match = this.state.miner_data.find(a => a.ip == miner.address);
                    
                    if (match.hist.length == 0 || lastMHs == null) {
                        miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: [lastMHs], cap: match.cap});
                    } else if (!match.hist.map(a => a.Timestamp).includes(lastMHs.Timestamp)) {
                        match.hist.push(lastMHs);
                        miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist, cap: match.cap});
                    } else {
                        miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist, cap: match.cap});
                    }
                }
            } catch(err) {
                miner_data.push({ip: miner.address, sum: null, hist: null})
            }
        }
        this.setState({miner_data: miner_data});
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
            });
        }
    }

    componentDidMount() {
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

    addMiner(ip) {
        let prev = miners.map(a => a.address);
        if (!prev.includes(ip)) {
            miners.push({address: ip, service: {port: 4028}});

            var temp = this.state.miner_data;
            temp.push({ip: ip, sum: 'load', hist: 'load'});
        
            notify('success', `Successfully added ${ip}`);
            this.setState({miner_data: temp});
        } else {
            notify('info', `${ip} already tracked`);
        }
    }

    delMiner(ids) {
        var temp = this.state.miner_data;
        for (let id of ids.reverse()) {
            miners.splice(id, 1);
            temp.splice(id, 1);
        }

        console.log(miners);
        notify('success', 'Successfully removed miners');
        this.setState({miner_data: temp});
    }

    blacklist(ids) {
        var temp = this.state.miner_data;
        for (let id of ids.reverse()) {
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
        switch(api) {
            case '/pool':
                obj = {param: data.pool, password: data.password};
                break;
            case '/login':
                obj = {
                    param: {login: data.worker + '.' + data.password, password: data.wallet_pass},
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
            case '/reboot':
                obj = {param: data.delay, password: data.password};
                break;
            case '/hwconfig':
                obj = {param: true, password: data.password};
                break;
        }

        for (let i of selected) {
            try {
                const {body} = await got.post(`http://${miners[i].address}:${miners[i].service.port}${api}`, {
                    json: obj,
                    timeout: 5000,
                    responseType: 'json'
                });
                
                if (body.result) {
                    notify('success', `${miners[i].address}: ${body.result}`);
                    /*if (api == '/reboot') {
                        var temp = this.state.miner;
                    }*/
                } else {
                    notify('error', `${miners[i].address}: ${body.error}`);
                }
            } catch(err) {
                console.log(err);
            }
        }
    }

    async handleFormApi(api, data, selected) {
        var f = {
            'password': data.password,
            'checksum': sha256(data.filepath),
            'keepsettings': data.keep,
            'swupdate.swu': fs.createReadStream(data.filepath)
        };

        console.log(f);

        for (let i of selected) {
            try {
                const {body} = await got.post(`http://${miners[i].address}:${miners[i].service.port}${api}`, {
                    form: f,
                    headers: {'Content-Type': 'multipart/form-data'},
                    responseType: 'json',
                    timeout: 7200000 // 2hrs?
                });

                if (body.result) {
                    notify('success', `${miners[i].address}: updating in progress`);
                } else {
                    notify('error', `${miners[i].address}: ${body.error}`);
                }
            } catch(err) {
                console.log(err);
            }
        }   
    }
 
    render() {
        return (
            <React.Fragment>
                <Button onClick={() => this.toggleDrawer(true)}>Open</Button>
                <Drawer open={this.state.drawerOpen} onClose={() => this.toggleDrawer(false)}>
                    <div onClick={() => this.toggleDrawer(false)}>
                        <List>
                            <ListItem button key="Dashboard" onClick={() => this.setPage('main')}>
                                <AssessmentIcon/>
                                <ListItemText primary="Dashboard"/>
                            </ListItem>
                            <ListItem button key="Table" onClick={() => this.setPage('table')}>
                                <ListAltIcon/>
                                <ListItemText primary="Table"/>
                            </ListItem>
                            <ListItem button key="Support" onClick={() => this.setPage('support')}>
                                <ContactSupportIcon/>
                                <ListItemText primary="Support"/>
                            </ListItem>
                        </List>
                    </div>
                </Drawer>
                <Dialog open={this.state.modal} onClose={() => this.state.toggleModal(false)}>
                    <DialogTitle>No Miners found</DialogTitle>
                    <DialogContent>
                        If you are connecting over a VPN, this software will not detect your miners.
                        You must manually add miners by IP in the Miner List tab.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                                    this.toggleModal(false);
                                    this.setPage('table');
                                }} color="primary">
                            Navigate to List
                        </Button>
                        <Button onClick={() => this.toggleModal(false)} color="primary">
                            Dismiss
                        </Button>
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
                { this.state.page == 'main' && <Dashboard data={this.state.miner_data}/> }
                { this.state.page == 'table' &&
                    <DataTable data={this.state.miner_data} 
                        addMiner={this.addMiner} delMiner={this.delMiner} blacklist={this.blacklist}
                        handleApi={this.handleApi} handleFormApi={this.handleFormApi}
                    />
                }
                { this.state.page == 'support' && <Support data={this.state}/> }
            </React.Fragment>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("react"));