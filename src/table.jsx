import * as React from 'react';
import { Tabs, Tab, Paper } from '@material-ui/core';
import { AddRemoveTab } from './tabs/AddRemoveTab.jsx';
import { CoinTab } from './tabs/CoinTab.jsx';
import { MinerPoolTab } from './tabs/MinerPoolTab.jsx';
import { WalletAddrTab } from './tabs/WalletAddrTab.jsx';
import { OpModeTab } from './tabs/OpModeTab.jsx';
import { UniqueIDTab } from './tabs/UniqueIDTab.jsx';
import { PasswordTab } from './tabs/PasswordTab.jsx';
import { UpdateTab } from './tabs/UpdateTab.jsx';
import { RebootTab } from './tabs/RebootTab.jsx';
import { LedTab } from './tabs/LedTab.jsx';
import { RecalibrateTab } from './tabs/RecalibrateTab.jsx';
import { CmdTab } from './tabs/CmdTab.jsx';
import { FanTab } from './tabs/FanTab.jsx';
import './table.css';

import Table from './customTable.jsx';

const columns = [
    { accessor: 'ip', Header: 'IP', width: 130 },
    { accessor: 'name', Header: 'Name', width: 150 },
    { accessor: 'firmware', Header: 'Firmware', width: 150 },
    { accessor: 'model', Header: 'Model', width: 100},
    { accessor: 'mode', Header: 'Mode', width: 100 },
    { accessor: 'pool', Header: 'Pool', width: 180 },
    { accessor: 'user', Header: 'User', width: 180 },
    { accessor: 'start', Header: 'Started', width: 260 },
    { accessor: 'uptime', Header: 'Uptime', width: 135 },
    { accessor: 'hbs', Header: 'Active HBs', width: 120},
    { accessor: 'hashrate15min', Header: 'Hashrate (15min)', width: 150},
    { accessor: 'hashrate1hr', Header: 'Hashrate (1h)', width: 150}, 
    { accessor: 'hashrate6hr', Header: 'Hashrate (6h)', width: 150},
    { accessor: 'hashrate24hr', Header: 'Hashrate (24h)', width: 150},
    { accessor: 'accepted', Header: 'Accepted Shares', width: 150},
    { accessor: 'rejected', Header: 'Rejected Shares', width: 150},
    { accessor: 'difficulty', Header: 'Difficulty', width: 120},
    { accessor: 'temperature', Header: 'Temp \u00b0C', width: 110 },
    { accessor: 'power', Header: 'Power (W)', width: 110}
];

const defaultHidden = ['model', 'start', 'uptime', 'hashrate1hr',
    'hashrate6hr', 'hashrate24hr', 'accepted', 'rejected', 'difficulty', 'power', 'fanspeed'];

export class DataTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {models: ['Miners Loading...'], selected: {}, list: 0, tab: 0};

        this.select = this.select.bind(this);
        this.setList = this.setList.bind(this);
        this.setTab = this.setTab.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        if (this.props.models && this.props.models.length) {
            var newState = {models: this.props.models};
            this.props.models.forEach(key => {
                newState[key + '_sel'] = [];
                newState[key + '_state'] = {hiddenColumns: defaultHidden};
            });

            this.setState(newState);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.models != this.props.models) {
            var newState = {models: this.props.models};
            this.props.models.forEach(key => {
                newState[key + '_sel'] = [];
                newState[key + '_state'] = {hiddenColumns: defaultHidden};
            });

            this.setState(newState);
        }
    }

    hashrate_x_hr(row, x) {
        var sum = 0;
        if (x) {
            try {
                for (let obj of row.hist.slice(-x)) {
                    sum += obj.Hashrate;
                }
                sum /= x;
            } catch {
                sum = 'N/A'
            }
        } else {
            sum = row.sum.Session['Average MHs'];
        }

        if (sum > 999999) return `${Math.round(sum / 10000) / 100} TH/s`;
        if (sum > 999) return `${Math.round(sum / 10) / 100} GH/s`;
        else return `${Math.round(sum * 100) / 100} MH/s`;
    }

    secondsToHumanReadable(seconds){
        let mutSeconds = seconds;
        const days = Math.floor(seconds / 86400)
        mutSeconds -= days * 86400;
        const hours = Math.floor(mutSeconds / 3600)
        mutSeconds -= hours * 3600;
        const minutes = Math.floor(mutSeconds / 60)
        mutSeconds -= minutes * 60;
        return days+'d '+hours+'h '+minutes+'m '+mutSeconds+'s';
    }

    maxTemp(data) {
        const temps = data.map(a => a.Temperature);
        return Math.max.apply(null, temps);
    }

    totalPower(data) {
        const power = data.map(a => a['Input Power']);
        var sum;
        sum = power.reduce((total, num) => {
            return total + num;
        }, 0);
        return Math.round(sum);
    }

    select(sel_model, model) {
        this.setState({[model + '_sel']: sel_model});
    }

    setList(event, newVal) {
        this.setState({list: newVal});
    }

    setTab(event, newVal) {
        this.setState({tab: newVal});
    }
    
    failSafe(summary) {
        if (summary) {
            if (summary == 'load') return 'Loading';
            if (summary == 'reboot') return 'Rebooting';
            return undefined;
        }
        return 'Error'
    }

    update(newState, action, prevState, data, model) {
        if (action.type == 'toggleHideColumn' || action.type == 'toggleHideAllColumns') {
            var temp = {};
            this.props.models.forEach(mod => {
                temp[mod + '_state'] = Object.assign({}, this.state[mod + '_state']);
                temp[mod + '_state'].hiddenColumns = newState.hiddenColumns;
            });

            this.setState(temp);
        } else if (action.type == 'toggleRowSelected') {
            var temp = Array.from(this.state[model + '_sel']);

            if (action.value) {
                temp.push(data[action.id].id);
            } else {
                temp.splice(temp.indexOf(data[action.id].id), 1);
            }

            this.setState({ [model + '_sel']: temp, [model + '_state']: newState });
        } else if (action.type == 'toggleAllRowsSelected') {
            if (this.state[model + '_sel']) {
                var sel = [];

                Object.keys(newState.selectedRowIds).forEach(id => {
                    sel.push(data[id].id);
                });

                this.setState({ [model + '_sel']: sel, [model + '_state']: newState });
            }
        } else {
            this.setState({ [model + '_state']: newState });
        }
    }

    render() {
        const rows = this.props.data.map(
            (a, i) => ({
                id: i,
                ip: a ? a.ip : '', //TODO: figure out why this is was falsey
                name: this.failSafe(a.sum) || a.sum.Hostname,
                firmware: this.failSafe(a.sum) || a.sum.Software,
                model: this.failSafe(a.cap) || a.cap.Model,
                mode: this.failSafe(a.sum) || a.sum.Preset,
                pool: this.failSafe(a.sum) || a.sum.Stratum['Current Pool'],
                user: this.failSafe(a.sum) || a.sum.Stratum['Current User'],
                start: this.failSafe(a.sum) || a.sum.Session['Startup Timestamp'],
                uptime: this.failSafe(a.sum) || this.secondsToHumanReadable(a.sum.Session.Uptime),
                hbs: this.failSafe(a.sum) || a.sum.Session['Active HBs'],
                hashrate15min: this.failSafe(a.sum) || this.hashrate_x_hr(a, null),
                hashrate1hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 1),
                hashrate6hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 6),
                hashrate24hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 24),
                accepted: this.failSafe(a.sum) || a.sum.Session.Accepted,
                rejected: this.failSafe(a.sum) || a.sum.Session.Rejected,
                difficulty: this.failSafe(a.sum) || a.sum.Session.Difficulty,
                temperature: this.failSafe(a.sum) || this.maxTemp(a.sum.HBs),
                power: this.failSafe(a.sum) || this.totalPower(a.sum.HBs),
                fanspeed: this.failSafe(a.sum) || a.sum.Fans['Fans Speed'],
                cap: a.cap
            })
        );

        var miners = {};

        for (let row of rows) {
            if (row.cap) {
                if (miners[row.model]) miners[row.model].push(row);
                else miners[row.model] = [row];
            }
            else miners['undefined'] ? miners['undefined'].push(row) : miners['undefined'] = [row];
        }

        var selected;
        selected = this.state[this.state.models[this.state.list] + '_sel'] || [];

        var capApi = true;
        for (let i of selected) {
            if (!this.props.data[i].cap) {
                capApi = false;
                break;
            }
        }

        return (
            <div style={{ maxWidth: '1400px', margin: '0 auto'}} id="table">
                <Tabs value={this.state.list} onChange={this.setList} indicatorColor="primary"
                    textColor="primary" centered
                >
                    { this.state.models.map(model => {
                        return <Tab id="minerTab" key={model} label={model}/>;
                    })}
                </Tabs>
                <canvas id="canvas" hidden></canvas>
                <div style={{ width: '100%', height: 500 }}>
                    { this.state.models.map((model, i) => {
                        return this.state.list == i ? (
                            <Paper variant="outlined" className="datatable-wrap" style={{ width: "100%", overflow: "hidden" }} key={model}>
                                <Table
                                    dataRaw={miners[model] || []}
                                    //columnsRaw={columns}
                                    extstate={this.state[model + '_state'] || {hiddenColumns: defaultHidden}}
                                    update={this.update}
                                    extmodel={model}
                                />
                            </Paper>
                        ) : null;
                    })}
                </div>
                <Tabs value={this.state.tab} onChange={this.setTab} indicatorColor="primary"
                    textColor="primary" scrollButtons="auto" variant="scrollable"
                >
                    <Tab label="Add/Remove"/>
                    <Tab label="CMD"/>
                    <Tab label="Coin" disabled={!capApi}/>
                    <Tab label="Mining Pool"/>
                    <Tab label="Wallet Address"/>
                    <Tab label="Operating Mode"/>
                    <Tab label="Unique ID"/>
                    <Tab label="Password"/>
                    <Tab label="Firmware"/>
                    <Tab label="Reboot"/>
                    <Tab label="LED"/>
                    <Tab label="Recalibrate"/>
                    <Tab label="Fans" disabled={!capApi}/>
                </Tabs>
                <div hidden={this.state.tab != 0}>
                    <AddRemoveTab
                        addMiner={this.props.addMiner} delMiner={this.props.delMiner} blacklist={this.props.blacklist}
                        saveMiners={this.props.saveMiners} loadMiners={this.props.loadMiners} list={this.state.list}
                        models={this.state.models} selected={selected} select={this.select}
                    />
                </div>
                <div hidden={this.state.tab != 1}>
                    <CmdTab handleApi={this.props.handleApi} selected={selected} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 2}>
                    <CoinTab
                        handleApi={this.props.handleApi} list={this.state.list} disabled={!capApi}
                        selected={selected} data={this.props.data} miners={miners} list={this.state.list}
                        models={this.state.models} sessionPass={this.props.sessionPass}
                    />
                </div>
                <div hidden={this.state.tab != 3}>
                    <MinerPoolTab handleApi={this.props.handleApi} selected={selected} data={this.props.data} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 4}>
                    <WalletAddrTab handleApi={this.props.handleApi} selected={selected} data={this.props.data} sessionPass={this.props.sessionPass} list={this.state.list}/>
                </div>
                <div hidden={this.state.tab != 5}>
                    <OpModeTab handleApi={this.props.handleApi} selected={selected} miners={miners}
                        list={this.state.list} models={this.state.models} sessionPass={this.props.sessionPass}
                    />
                </div>
                <div hidden={this.state.tab != 6}>
                    <UniqueIDTab handleApi={this.props.handleApi} selected={selected} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 7}>
                    <PasswordTab handleApi={this.props.handleApi} selected={selected} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 8}>
                    <UpdateTab handleApi={this.props.handleFormApi} selected={selected} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 9}>
                    <RebootTab handleApi={this.props.handleApi} selected={selected} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 10}>
                    <LedTab handleApi={this.props.handleApi} selected={selected} sessionPass={this.props.sessionPass}/> 
                </div>
                <div hidden={this.state.tab != 11}>
                    <RecalibrateTab handleApi={this.props.handleApi} selected={selected} sessionPass={this.props.sessionPass}/>
                </div>
                <div hidden={this.state.tab != 12}> 
                    <FanTab handleApi={this.props.handleApi} selected={selected} disabled={!capApi} sessionPass={this.props.sessionPass}/>
                </div>
            </div>
        );
    }
}