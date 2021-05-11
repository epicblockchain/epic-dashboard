const { ipcRenderer } = require('electron');
const got = require('got');
const mdns = require('node-dns-sd');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sidebar from 'react-sidebar';
import { Dashboard } from './dashboard.jsx';
import { TestTable } from './table.jsx'

import { Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import "@blueprintjs/core/lib/css/blueprint.css";

var miners = [];

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
            miners: []
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    }

    async test() {
        var miner_data = [];
        for (let miner of miners) {
            try {
                const data = await got(`http://${miner.address}:${miner.service.port}/summary`);
                miner_data.push(data.body);
            } catch(err) {
                miner_data.push(err);
            }
        }
        this.setState({miners: miner_data});
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.miners != this.state.miners) {
            mdns.discover({
                name: '_epicminer._tcp.local'
            }).then((list) => {
                miners = list;
                this.test();
                setTimeout(() => {
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
            this.test();
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
                    { this.state.page == 'main' && <Dashboard data={this.state.miners}/> }
                    { this.state.page == 'table' && <TestTable/> }
                </Sidebar>
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("react"));