import * as React from 'react';
import {
    DataGrid,
    GridToolbarContainer,
    GridFilterToolbarButton,
    GridColumnsToolbarButton,
    GridDensitySelector } from '@material-ui/data-grid';
import { Tabs, Tab } from '@material-ui/core';

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

    render() {
        const rows = this.props.data.map(
            (a, i) => ({
                id: i,
                ip: a.ip,
                name: a.sum.Hostname,
                firmware: a.sum.Software,
                mode: a.sum.Preset,
                pool: a.sum.Stratum['Current Pool'],
                user: a.sum.Stratum['Current User'],
                start: a.sum.Session['Startup Timestamp'],
                uptime: this.secondsToHumanReadable(a.sum.Session.Uptime),
                hbs: a.sum.Session['Active HBs'],
                hashrate15min: Math.round(a.sum.Session['Average MHs'] / 10000) / 100,
                hashrate1hr: this.hashrate_x_hr(i, 1),
                hashrate6hr: this.hashrate_x_hr(i, 6),
                hashrate24hr: this.hashrate_x_hr(i, 24),
                accepted: a.sum.Session.Accepted,
                rejected: a.sum.Session.Rejected,
                difficulty: a.sum.Session.Difficulty,
                temperature: this.maxTemp(a.sum.HBs),
                power: this.totalPower(a.sum.HBs)
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
                <Tabs centered value={this.state.tab} onChange={this.setTab}>
                    <Tab label="Mining Pool"/>
                    <Tab label="Wallet Address"/>
                    <Tab label="Operating Mode"/>
                    <Tab label="Password"/>
                    <Tab label="Firmware"/>
                    <Tab label="Reboot"/>
                    <Tab label="Recalibrate"/>
                </Tabs>
                { this.state.tab == 0 && <div>One</div> }
                { this.state.tab == 1 && <div>Two</div> }
                { this.state.tab == 2 && <div>Three</div> }
                { this.state.tab == 3 && <div>Four</div> }
                { this.state.tab == 4 && <div>Five</div> }
                { this.state.tab == 5 && <div>Six</div> }
                { this.state.tab == 6 && <div>Seven</div> }
            </div>
        );
    }
}