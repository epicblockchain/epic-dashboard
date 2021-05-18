const { ipcRenderer } = require('electron');
const got = require('got');
const mdns = require('node-dns-sd');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dashboard } from './dashboard.jsx';
import { DataTable } from './table.jsx';
import { Support } from './support.jsx';

import { Drawer, ListItem, ListItemIcon, ListItemText, Button, List, Divider,
        Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
        Snackbar
    } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
import AssessmentIcon from '@material-ui/icons/Assessment';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';

var miners = [];

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerOpen: true,
            page: 'main',
            miner_data: [],
            modal: false,
            snackbar: {open: false, sev: '', text: ''}
        };

        this.addMiner = this.addMiner.bind(this);
        this.handleApi = this.handleApi.bind(this);
        this.toggleSnackbar = this.toggleSnackbar.bind(this);
    }

    async summary(init) {
        var miner_data = [];
        
        for (let miner of miners) {
            try {
                const summary = await got(`http://${miner.address}:${miner.service.port}/summary`, {
                    timeout: 2000
                });
                if (init) {
                    const history = await got(`http://${miner.address}:${miner.service.port}/history`);
                    miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: JSON.parse(history.body).History});
                } else {
                    const lastMHs = JSON.parse(summary.body).Session.LastAverageMHs;
                    let match = this.state.miner_data.find(a => a.ip == miner.address);
                    
                    if (match.hist.length == 0 || lastMHs == null) {
                        miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: [lastMHs]});
                    } else if (!match.hist.map(a => a.Timestamp).includes(lastMHs.Timestamp)) {
                        match.hist.push(lastMHs);
                        miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist});
                    } else {
                        miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist});
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
            if (!list.length) {
                this.toggleModal(true);
            } else {
                miners = list.sort(this.compare);
                this.summary(true);
            } 
            console.log('mounted');
        });
    }

    toggleDrawer(open) {
        this.setState({drawerOpen: open});
    };

    toggleModal(open) {
        this.setState({modal: open});
    }

    toggleSnackbar(open) {
        this.setState({snackbar: {open: open, sev: this.state.snackbar.sev}});
    }

    setPage(page) {
        this.setState({page: page});
    }

    addMiner(ip) {
        var temp = this.state.miner_data;
        miners.push({address: ip, service: {port: 4028}});
        temp.push({ip: ip, sum: 'load', hist: 'load'});
        
        this.setState({miner_data: temp});
    }

    delMiner(ids) {
        for (let id of ids) {
            miners.splice(id, 1);
        }
    }

    async handleApi(api, data, selected) {
        var obj;
        switch(api) {
            case '/pool':
                obj = {param: data.pool, password: data.password};
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
                    console.log('good');
                } else {
                    console.log('clicked');
                    this.setState({snackbar: {open: true, sev: 'error', text: body.error}});
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
                <Snackbar open={this.state.snackbar.open}
                    autoHideDuration={6000}>
                    <MuiAlert elevation={6} variant='filled' onClose={() => this.toggleSnackbar(false)}
                        severity={this.state.snackbar.sev}>
                        {this.state.snackbar.text}
                    </MuiAlert>
                </Snackbar>
                { this.state.page == 'main' && <Dashboard data={this.state.miner_data}/> }
                { this.state.page == 'table' &&
                    <DataTable data={this.state.miner_data} 
                        addMiner={this.addMiner} delMiner={this.delMiner}
                        handleApi={this.handleApi}
                    />
                }
                { this.state.page == 'support' && <Support data={this.state}/> }
            </React.Fragment>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("react"));