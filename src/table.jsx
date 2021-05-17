import * as React from 'react';
import {
    DataGrid,
    GridToolbarContainer,
    GridFilterToolbarButton,
    GridColumnsToolbarButton,
    GridDensitySelector } from '@material-ui/data-grid';
import { Tabs, Tab } from '@material-ui/core';
import { AddRemoveTab } from './tabs/AddRemoveTab.jsx';
import { MinerPoolTab } from './tabs/MinerPoolTab.jsx';

const columns = [
    { field: 'ip', headerName: 'IP', width: 130 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'firmware', headerName: 'Firmware', width: 150 },
    { field: 'mode', headerName: 'Mode', width: 100 },
    { field: 'pool', headerName: 'Pool', width: 180 },
    { field: 'user', headerName: 'User', width: 180 },
    { field: 'start', headerName: 'Started', width: 260, hide: true },
    { field: 'uptime', headerName: 'Uptime', width: 135, hide: true },
    { field: 'hbs', headerName: 'Active HBs', width: 120 },
    { field: 'hashrate15min', headerName: 'Hashrate (15min)', width: 150 },
    { field: 'hashrate1hr', headerName: 'Hashrate (1h)', width: 150, hide: true }, 
    { field: 'hashrate6hr', headerName: 'Hashrate (6h)', width: 150, hide: true },
    { field: 'hashrate24hr', headerName: 'Hashrate (24h)', width: 150, hide: true },
    { field: 'accepted', headerName: 'Accepted Shares', width: 150, hide: true },
    { field: 'rejected', headerName: 'Rejected Shares', width: 150, hide: true },
    { field: 'difficulty', headerName: 'Difficulty', width: 120, hide: true },
    { field: 'temperature', headerName: 'Temp \u00b0C', width: 110 },
    { field: 'power', headerName: 'Power (W)', width: 110, hide: true }
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
        this.state = {selected: [], tab: 0};
        this.select = this.select.bind(this);
        this.setTab = this.setTab.bind(this);
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
        return Math.round(sum / 10000) / 100;
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
        var sum = power.reduce((total, num) => {
            return total + num;
        });
        return Math.round(sum);
    }

    select(model) {
        console.log('before set state', model);
        var temp = model;
        this.setState({selected: temp});
    }

    setTab(event, newVal) {
        this.setState({tab: newVal});
    }
    
    failSafe(summary) {
        if (summary) {
            if (summary == 'load') return 'Loading';
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
                mode: this.failSafe(a.sum) || a.sum.Preset,
                pool: this.failSafe(a.sum) || a.sum.Stratum['Current Pool'],
                user: this.failSafe(a.sum) || a.sum.Stratum['Current User'],
                start: this.failSafe(a.sum) || a.sum.Session['Startup Timestamp'],
                uptime: this.failSafe(a.sum) || this.secondsToHumanReadable(a.sum.Session.Uptime),
                hbs: this.failSafe(a.sum) || a.sum.Session['Active HBs'],
                hashrate15min: this.failSafe(a.sum) || Math.round(a.sum.Session['Average MHs'] / 10000) / 100,
                hashrate1hr: this.failSafe(a.sum) || this.hashrate_x_hr(i, 1),
                hashrate6hr: this.failSafe(a.sum) || this.hashrate_x_hr(i, 6),
                hashrate24hr: this.failSafe(a.sum) || this.hashrate_x_hr(i, 24),
                accepted: this.failSafe(a.sum) || a.sum.Session.Accepted,
                rejected: this.failSafe(a.sum) || a.sum.Session.Rejected,
                difficulty: this.failSafe(a.sum) || a.sum.Session.Difficulty,
                temperature: this.failSafe(a.sum) || this.maxTemp(a.sum.HBs),
                power: this.failSafe(a.sum) || this.totalPower(a.sum.HBs)
            })
        );

        return (
            <div style={{ height: 500, maxWidth: '1400px', margin: '0 auto'}}>
                <DataGrid rows={rows} columns={columns} checkboxSelection
                    components={{Toolbar: Toolbar}}
                    selectionModel={this.selected}
                    rowHeight={32}
                    onSelectionModelChange={sel => {
                        this.select(sel.selectionModel);
                        console.log(this.state.selected);
                    }}
                    /*onRowSelected={sel => {
                        this.select(sel.data.ip, sel.isSelected);
                    }}*/
                />
                <Tabs value={this.state.tab} onChange={this.setTab}
                    variant="scrollable" indicatorColor="primary" textColor="primary"
                    scrollButtons="auto"
                >
                    <Tab label="Add/Remove"/>
                    <Tab label="Mining Pool"/>
                    <Tab label="Wallet Address"/>
                    <Tab label="Operating Mode"/>
                    <Tab label="Password"/>
                    <Tab label="Firmware"/>
                    <Tab label="Reboot"/>
                    <Tab label="Recalibrate"/>
                </Tabs>
                { this.state.tab == 0 &&
                    <AddRemoveTab
                        addMiner={this.props.addMiner}
                        delMiner={this.props.delMiner}
                        selected={this.state.selected}
                    /> }
                { this.state.tab == 1 &&
                    <MinerPoolTab
                        handleApi={this.props.handleApi}
                        selected={this.state.selected}
                    /> }
                { this.state.tab == 2 && <div>Three</div> }
                { this.state.tab == 3 && <div>Four</div> }
                { this.state.tab == 4 && <div>Five</div> }
                { this.state.tab == 5 && <div>Six</div> }
                { this.state.tab == 6 && <div>Seven</div> }
                { this.state.tab == 7 && <div>Eight</div> }
            </div>
        );
    }
}