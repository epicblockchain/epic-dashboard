import * as React from 'react';
import {
    DataGrid,
    GridToolbarContainer,
    GridFilterToolbarButton,
    GridColumnsToolbarButton,
    GridDensitySelector } from '@material-ui/data-grid';
import { Tabs, Tab } from '@material-ui/core';
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

const columns = [
    { field: 'ip', headerName: 'IP', width: 130 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'firmware', headerName: 'Firmware', width: 150 },
    { field: 'model', headerName: 'Model', width: 100, hide: true},
    { field: 'mode', headerName: 'Mode', width: 100 },
    { field: 'pool', headerName: 'Pool', width: 180 },
    { field: 'user', headerName: 'User', width: 180 },
    { field: 'start', headerName: 'Started', width: 260, hide: true },
    { field: 'uptime', headerName: 'Uptime', width: 135, hide: true },
    { field: 'hbs', headerName: 'Active HBs', width: 120, type: 'number' },
    { field: 'hashrate15min', headerName: 'Hashrate (15min)', width: 150, type: 'number' },
    { field: 'hashrate1hr', headerName: 'Hashrate (1h)', width: 150, type: 'number', hide: true }, 
    { field: 'hashrate6hr', headerName: 'Hashrate (6h)', width: 150, type: 'number', hide: true },
    { field: 'hashrate24hr', headerName: 'Hashrate (24h)', width: 150, type: 'number', hide: true },
    { field: 'accepted', headerName: 'Accepted Shares', width: 150, type: 'number', hide: true },
    { field: 'rejected', headerName: 'Rejected Shares', width: 150, type: 'number', hide: true },
    { field: 'difficulty', headerName: 'Difficulty', width: 120, type: 'number', hide: true },
    { field: 'temperature', headerName: 'Temp \u00b0C', type: 'number', width: 110 },
    { field: 'power', headerName: 'Power (W)', width: 110, type: 'number', hide: true },
    { field: 'cap', hide: true }
];

function Toolbar() {
    return(
        <GridToolbarContainer>
            <GridColumnsToolbarButton/>
            <GridFilterToolbarButton/>
            <GridDensitySelector/>
        </GridToolbarContainer>
    );
}

export class DataTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {models: ['Miners Loading...'], selected: {}, list: 0, tab: 0};

        this.select = this.select.bind(this);
        this.setList = this.setList.bind(this);
        this.setTab = this.setTab.bind(this);
    }

    componentDidMount() {
        if (this.props.models && this.props.models.length) {
            var sel = {};
            this.props.models.forEach(key => sel[key] = []);
            this.setState({models: this.props.models, selected: sel});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.models != this.props.models) {
            var sel = {};
            this.props.models.forEach(key => sel[key] = []);
            this.setState({models: this.props.models, selected: sel});
        }
    }

    hashrate_x_hr(row, x) {
        var sum = 0;
        try {
            for (let obj of this.props.data[row].hist.slice(-x)) {
                sum += obj.Hashrate;
            }
            sum /= x;
        } catch {
            sum = 'N/A'
        }
        return Math.round(sum / 100) / 10000;
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
        try {
            sum = power.reduce((total, num) => {
                return total + num;
            });
        } catch (err) {
            console.log(err);
            sum = 'N/A';
        }
        return Math.round(sum);
    }

    select(sel_model, model) {
        var temp = this.state.selected;
        temp[model] = sel_model;
        this.setState({selected: temp});
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

    render() {
        const rows = this.props.data.map(
            (a, i) => ({
                id: i,
                ip: a.ip,
                name: this.failSafe(a.sum) || a.sum.Hostname,
                firmware: this.failSafe(a.sum) || a.sum.Software,
                model: this.failSafe(a.cap) || a.cap.Model,
                mode: this.failSafe(a.sum) || a.sum.Preset,
                pool: this.failSafe(a.sum) || a.sum.Stratum['Current Pool'],
                user: this.failSafe(a.sum) || a.sum.Stratum['Current User'],
                start: this.failSafe(a.sum) || a.sum.Session['Startup Timestamp'],
                uptime: this.failSafe(a.sum) || this.secondsToHumanReadable(a.sum.Session.Uptime),
                hbs: this.failSafe(a.sum) || a.sum.Session['Active HBs'],
                hashrate15min: this.failSafe(a.sum) || Math.round(a.sum.Session['Average MHs'] / 100) / 10000,
                hashrate1hr: this.failSafe(a.sum) || this.hashrate_x_hr(i, 1),
                hashrate6hr: this.failSafe(a.sum) || this.hashrate_x_hr(i, 6),
                hashrate24hr: this.failSafe(a.sum) || this.hashrate_x_hr(i, 24),
                accepted: this.failSafe(a.sum) || a.sum.Session.Accepted,
                rejected: this.failSafe(a.sum) || a.sum.Session.Rejected,
                difficulty: this.failSafe(a.sum) || a.sum.Session.Difficulty,
                temperature: this.failSafe(a.sum) || this.maxTemp(a.sum.HBs),
                power: this.failSafe(a.sum) || this.totalPower(a.sum.HBs),
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
        selected = this.state.selected[this.state.models[this.state.list]] || [];

        var capApi = true;
        for (let i of selected) {
            if (!this.props.data[i].cap) {
                capApi = false;
                break;
            }
        }

        return (
            <div style={{ maxWidth: '1400px', margin: '0 auto'}}>
                <Tabs value={this.state.list} onChange={this.setList} indicatorColor="primary"
                    textColor="primary" centered
                >
                    { this.state.models.map(model => {
                        return <Tab id="minerTab" key={model} label={model}/>;
                    })}
                </Tabs>
                <div style={{ width: '100%', height: 500 }}>
                    { this.state.models.map((model, i) => {
                        return this.state.list == i ? (
                            <DataGrid rows={miners[model] || []} columns={columns} checkboxSelection
                                components={{Toolbar: Toolbar}}
                                selectionModel={this.state.selected[model]}
                                rowHeight={32} key={model}
                                onSelectionModelChange={sel => {
                                    this.select(sel.selectionModel, model);
                                }}
                            />
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
                    <CmdTab handleApi={this.props.handleApi} selected={selected}/>
                </div>
                <div hidden={this.state.tab != 2}>
                    <CoinTab
                        handleApi={this.props.handleApi} list={this.state.list} disabled={!capApi}
                        selected={selected} data={this.props.data} miners={miners} list={this.state.list}
                        models={this.state.models}
                    />
                </div>
                <div hidden={this.state.tab != 3}>
                    <MinerPoolTab handleApi={this.props.handleApi} selected={selected} data={this.props.data}/>
                </div>
                <div hidden={this.state.tab != 4}>
                    <WalletAddrTab handleApi={this.props.handleApi} selected={selected} data={this.props.data}/>
                </div>
                <div hidden={this.state.tab != 5}>
                    <OpModeTab handleApi={this.props.handleApi} selected={selected} miners={miners}
                        list={this.state.list} models={this.state.models}
                    />
                </div>
                <div hidden={this.state.tab != 6}>
                    <UniqueIDTab handleApi={this.props.handleApi} selected={selected}/>
                </div>
                <div hidden={this.state.tab != 7}>
                    <PasswordTab handleApi={this.props.handleApi} selected={selected}/>
                </div>
                <div hidden={this.state.tab != 8}>
                    <UpdateTab handleApi={this.props.handleFormApi} selected={selected}/>
                </div>
                <div hidden={this.state.tab != 9}>
                    <RebootTab handleApi={this.props.handleApi} selected={selected}/>
                </div>
                <div hidden={this.state.tab != 10}>
                    <LedTab handleApi={this.props.handleApi} selected={selected}/> 
                </div>
                <div hidden={this.state.tab != 11}>
                    <RecalibrateTab handleApi={this.props.handleApi} selected={selected}/>
                </div>
                <div hidden={this.state.tab != 12}> 
                    <FanTab handleApi={this.props.handleApi} selected={selected} disabled={!capApi}/>
                </div>
            </div>
        );
    }
}