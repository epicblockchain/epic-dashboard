const { ipcRenderer } = require('electron');
const got = require('got');
const mdns = require('node-dns-sd');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sidebar from 'react-sidebar';
import { Dashboard } from './dashboard.jsx';
import { DataTable, TestTable } from './table.jsx'

import { Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import "@blueprintjs/core/lib/css/blueprint.css";

var miners = [];
var miner_hist = [];

/*async function test() {
    var miner_data = [];
    for (let miner of miners) {
        try {
            const data = await got(`http://${miner.address}:${miner.service.port}/summary`);
            miner_data.push(data.body);
        } catch(err) {
            miner_data.push(err);
        }
    }
    sum = miner_data;
    i++;
}*/

//browser();

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sidebarOpen: true,
            page: 'main',
            miner_data: [],
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
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
                    if (lastMHs != null) {
                        let match = this.state.miner_data.find(a => a.ip == miner.address);
                        
                        if (match.hist.length == 0) {
                            miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: [lastMHs]});
                        } else if (!match.hist.map(a => a.Timestamp).includes(lastMHs.Timestamp)) {
                            match.hist.push(lastMHs);
                            miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist});
                        } else {
                            miner_data.push({ip: miner.address, sum: JSON.parse(summary.body), hist: match.hist});
                        }
                    }
                }
            } catch(err) {
                console.log(err);
            }
        }
        this.setState({miner_data: miner_data});
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.miner_data != this.state.miner_data) {
            mdns.discover({
                name: '_epicminer._tcp.local'
            }).then((list) => {
                miners = list;
                setTimeout(() => {
                    this.summary(false);
                    console.log('update');
                }, 3000);
            });
        }
    }

    componentDidMount() {
        mdns.discover({
            name: '_epicminer._tcp.local'
        }).then((list) => {
            miners = list;
            this.summary(true);
            console.log('mounted');
        });
    }

    onSetSidebarOpen(open) {
        this.setState({sidebarOpen: open});
    }

    setPage(page) {
        this.setState({page: page});
    }

    render() {
        return (
            <div>
                <Sidebar
                    sidebar={
                        <Menu>
                            <MenuItem text="Main" onClick={() => this.setPage('main')}/>
                            <MenuItem text="Table" onClick={() => this.setPage('table')}/>
                        </Menu>
                    }
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onSetSidebarOpen}
                    styles={{sidebar: {background: 'white'}}}
                >
                    <button onClick={() => this.onSetSidebarOpen(true)}>Open Sidebar</button>
                    { this.state.page == 'main' && <Dashboard data={this.state.miner_data}/> }
                    { this.state.page == 'table' && <DataTable data={this.state.miner_data}/> }
                </Sidebar>
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("react"));