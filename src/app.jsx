const { ipcRenderer } = require('electron');
const got = require('got');
const mdns = require('node-dns-sd');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dashboard } from './dashboard.jsx';
import { DataTable } from './table.jsx';

import { Drawer, ListItem, ListItemIcon, ListItemText, Button, List, Divider } from '@material-ui/core';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ListAltIcon from '@material-ui/icons/ListAlt';

var miners = [{
    address: "10.10.0.216",
    service: {
        port: "4028"
    }
}];

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerOpen: true,
            page: 'main',
            miner_data: [],
        };
        //this.toggleDrawer = this.toggleDrawer.bind(this);
    }

    async summary(init) {
        var miner_data = [];
        
        for (let miner of miners) {
            try {
                const summary = await got(`http://${miner.address}:${miner.service.port}/summary`);
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
                console.log(err);
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
        this.summary(false);
        // if (prevState.miner_data != this.state.miner_data) {
        //     mdns.discover({
        //         name: '_epicminer._tcp.local'
        //     }).then((list) => {
        //         let prev = miners.map(a => a.address);
        //         for (let miner of list) {
        //             if (!prev.includes(miner.address)) miners.push(miner);
        //         }
        //         
        //         setTimeout(() => {
        //             this.summary(false);
        //             console.log('update');
        //         }, 3000);
        //     });
        // }
    }

    componentDidMount() {
        this.summary(true);

        // /*mdns.startMonitoring().then(() => {
        //     console.log('Started');
        // }).catch((err) => {
        //     console.error(err);
        // });
        // console.log('mounted');
        // mdns.ondata = (packet) => {
        //     for (let ans of packet.answers) {
        //         if (ans.name == '_epicminer._tcp.local') {
        //             console.log(packet.address);
        //         }
        //     }
        // };*/
        // mdns.discover({
        //     name: '_epicminer._tcp.local'
        // }).then((list) => {
        //     miners = list.sort(this.compare);
        //     this.summary(true);
        //     console.log('mounted');
        // });
    }

    toggleDrawer(open) {
        /*if (event.type == 'keydown' && (event.key == 'Tab' || event.key == 'Shift')) {
            return;
        }*/
        this.setState({drawerOpen: open});
    };

    setPage(page) {
        this.setState({page: page});
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
                        </List>
                    </div>
                </Drawer>

                { this.state.page == 'main' && <Dashboard data={this.state.miner_data}/> }
                { this.state.page == 'table' && <DataTable data={this.state.miner_data}/> }
            </React.Fragment>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("react"));
