import * as React from 'react';
import {Tabs, Tab, Paper} from '@material-ui/core';
import {AddRemoveTab} from './tabs/AddRemoveTab.jsx';
import {CoinTab} from './tabs/CoinTab.jsx';
import {PerformanceTab} from './tabs/PerformanceTab.jsx';
import {SystemTab} from './tabs/SystemTab.jsx';
import {ControlTab} from './tabs/ControlTab.jsx';
import {FanTab} from './tabs/FanTab.jsx';
import {DebugTab} from './tabs/DebugTab.jsx';
import './table.css';

import Table from './customTable.jsx';

const defaultHidden = [
    'model',
    'start',
    'hashrate1hr',
    'hashrate6hr',
    'hashrate24hr',
    'efficiency1hr',
    'accepted',
    'rejected',
    'difficulty',
    'power',
    'fanspeed',
    'voltage',
];

function debounce1(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

export class DataTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {models: ['Miners Loading...'], selected: {}, list: 0, tab: 0, reset: false};

        this.select = this.select.bind(this);
        this.setList = this.setList.bind(this);
        this.setTab = this.setTab.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        window.onresize = debounce1(() => this.forceUpdate());

        if (this.props.models && this.props.models.length) {
            var newState = {models: this.props.models};
            this.props.models.forEach((key) => {
                newState[key + '_sel'] = [];
                newState[key + '_state'] = {hiddenColumns: defaultHidden};
            });

            this.setState(newState);
        }
    }

    selectReset() {
        var newState = {reset: true};
        this.props.models.forEach((key) => {
            newState[key + '_sel'] = [];
        });

        this.setState(newState);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.models != this.props.models) {
            var newModels = this.props.models.filter((x) => !prevProps.models.includes(x));
            var newState = {models: this.props.models};
            newModels.forEach((key) => {
                newState[key + '_sel'] = [];
                newState[key + '_state'] = {hiddenColumns: defaultHidden};
            });

            this.setState(newState);
        }

        if (this.state.models && prevProps.data) {
            let prev = prevProps.data.filter((x) => x.cap && x.cap.Model == this.state.models[this.state.list]);
            let curr = this.props.data.filter((x) => x.cap && x.cap.Model == this.state.models[this.state.list]);

            if (curr.length < prev.length) this.selectReset();
        }

        if (this.props.data.length < prevProps.data.length) this.selectReset();

        if (this.state.reset) this.setState({reset: false});
    }

    hashrate_x_hr(row, x, noFormat) {
        var sum = 0;
        if (x) {
            try {
                if (row.hist.length < x) {
                    sum = 'N/A';
                } else {
                    for (let obj of row.hist.slice(-x)) {
                        sum += obj.Hashrate;
                    }
                    sum /= x;
                }
            } catch {
                sum = 'N/A';
            }
        } else {
            sum = row.sum.Session['Average MHs'];
        }

        if (sum == 'N/A' || noFormat) return sum;
        if (sum > 999999) return `${Math.round(sum / 10000) / 100} TH/s`;
        if (sum > 999) return `${Math.round(sum / 10) / 100} GH/s`;
        else return `${Math.round(sum * 100) / 100} MH/s`;
    }

    efficiency(row) {
        const raw = this.hashrate_x_hr(row, 1, true) / this.totalPower(row.sum.HBs);
        if (isNaN(raw)) return 'N/A';
        return `${Math.round(raw * 100) / 100} MH/W`;
    }

    secondsToHumanReadable(seconds) {
        let mutSeconds = seconds;
        const days = Math.floor(seconds / 86400);
        mutSeconds -= days * 86400;
        const hours = Math.floor(mutSeconds / 3600);
        mutSeconds -= hours * 3600;
        const minutes = Math.floor(mutSeconds / 60);
        mutSeconds -= minutes * 60;
        return days + 'd ' + hours + 'h ' + minutes + 'm ' + mutSeconds + 's';
    }

    maxTemp(data) {
        const temps = data.map((a) => a.Temperature);
        return Math.max.apply(null, temps);
    }

    avgVoltage(data) {
        const volt = data.map((a) => a['Input Voltage']);
        var sum;
        sum = volt.reduce((total, num) => {
            return total + num;
        }, 0);
        sum = sum / data.length;
        return Math.round((sum + Number.EPSILON) * 100) / 100;
    }

    totalPower(data) {
        const power = data.map((a) => a['Input Power']);
        var sum;
        sum = power.reduce((total, num) => {
            return total + num;
        }, 0);
        return Math.round(sum);
    }

    activeHBs(hbs) {
        if (hbs.length < 3) {
            const active = hbs.map((a) => a.Index);

            return `${active.length} (${active.join(', ')})`;
        }
        return hbs.length;
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
        return 'Error';
    }

    update(newState, action, prevState, data, model) {
        if (action.type == 'toggleHideColumn' || action.type == 'toggleHideAllColumns') {
            var temp = {};
            this.props.models.forEach((mod) => {
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

            this.setState({[model + '_sel']: temp, [model + '_state']: newState});
        } else if (action.type == 'toggleAllRowsSelected') {
            if (this.state[model + '_sel']) {
                var sel = [];

                Object.keys(newState.selectedRowIds).forEach((id) => {
                    if (data[id]) sel.push(data[id].id);
                });

                this.setState({[model + '_sel']: sel, [model + '_state']: newState});
            }
        } else {
            this.setState({[model + '_state']: newState});
        }
    }

    render() {
        const rows = this.props.data.map((a, i) => ({
            id: i,
            ip: a ? a.ip : '', //TODO: figure out why this is was falsey
            name: this.failSafe(a.sum) || a.sum.Hostname,
            firmware: this.failSafe(a.sum) || a.sum.Software.split(' ')[1],
            model: this.failSafe(a.cap) || a.cap.Model,
            mode:
                this.failSafe(a.sum) ||
                (a.sum.Preset ? a.sum.Preset : `${a.sum.PresetInfo.Preset} @ ${a.sum.PresetInfo['Target Power']}W`),
            pool: this.failSafe(a.sum) || a.sum.Stratum['Current Pool'],
            user: this.failSafe(a.sum) || a.sum.Stratum['Current User'],
            start: this.failSafe(a.sum) || a.sum.Session['Startup Timestamp'],
            uptime: this.failSafe(a.sum) || this.secondsToHumanReadable(a.sum.Session.Uptime),
            hbs: this.failSafe(a.sum) || this.activeHBs(a.sum.HBs),
            hashrate15min: this.failSafe(a.sum) || this.hashrate_x_hr(a, null, false),
            hashrate1hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 1, false),
            hashrate6hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 6, false),
            hashrate24hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 24, false),
            efficiency1hr: this.failSafe(a.sum) || this.efficiency(a),
            accepted: this.failSafe(a.sum) || a.sum.Session.Accepted,
            rejected: this.failSafe(a.sum) || a.sum.Session.Rejected,
            difficulty: this.failSafe(a.sum) || a.sum.Session.Difficulty,
            temperature: this.failSafe(a.sum) || this.maxTemp(a.sum.HBs) + ' \u00b0C',
            power: this.failSafe(a.sum) || this.totalPower(a.sum.HBs),
            fanspeed: this.failSafe(a.sum) || a.sum.Fans['Fans Speed'],
            cap: a.cap,
            voltage: this.failSafe(a.sum) || this.avgVoltage(a.sum.HBs),
            status: this.failSafe(a.sum) || (a.sum.Status ? a.sum.Status['Operating State'] : 'N/A'),
            misc: this.failSafe(a.sum) || a.sum.Misc,
            connected:
                this.failSafe(a.sum) ||
                (a.sum.Stratum.IsPoolConnected !== undefined ? a.sum.Stratum.IsPoolConnected : 'Error'),
        }));

        var miners = {};

        for (let row of rows) {
            if (row.cap) {
                if (miners[row.model]) miners[row.model].push(row);
                else miners[row.model] = [row];
            } else miners['undefined'] ? miners['undefined'].push(row) : (miners['undefined'] = [row]);
        }

        var selected = this.state[this.state.models[this.state.list] + '_sel'] || [];

        var capApi = true;
        var eng_rig = true;
        for (let i of selected) {
            if (!this.props.data[i]) {
                selected = selected.filter((x) => x != i);
            } else if (!this.props.data[i].cap) {
                capApi = false;
                eng_rig = false;
                break;
            } else {
                if (this.props.data[i].cap.Model != 'ENG_RIG') {
                    eng_rig = false;
                }
            }
        }

        return (
            <div id="table">
                <Tabs
                    value={this.state.list}
                    onChange={this.setList}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    {this.state.models.map((model) => {
                        return <Tab id="minerTab" key={model} label={model} />;
                    })}
                </Tabs>
                <canvas id="canvas" hidden></canvas>
                <div style={{width: '100%', height: 500}}>
                    {this.state.models.map((model, i) => {
                        return this.state.list == i ? (
                            <Paper
                                variant="outlined"
                                className="datatable-wrap"
                                style={{width: '100%', overflow: 'hidden'}}
                                key={model}
                            >
                                <Table
                                    dataRaw={miners[model] || []}
                                    extstate={this.state[model + '_state'] || {hiddenColumns: defaultHidden}}
                                    update={this.update}
                                    extmodel={model}
                                    reset={this.state.reset}
                                    drawerOpen={this.props.drawerOpen}
                                    clear={model === 'undefined' ? this.props.clear : null}
                                    handleApi={this.props.handleApi}
                                />
                            </Paper>
                        ) : null;
                    })}
                </div>
                <div style={{maxWidth: '1400px', margin: '0 auto'}}>
                    <Tabs
                        value={this.state.tab}
                        onChange={this.setTab}
                        indicatorColor="primary"
                        textColor="primary"
                        scrollButtons="auto"
                        variant="scrollable"
                    >
                        <Tab label="Home" />
                        <Tab label="Miner Control" />
                        <Tab label="Mining Config" disabled={!capApi} />
                        <Tab label="Performance" />
                        <Tab label="System" />
                        <Tab label="Cooling" disabled={!capApi} />
                        {this.state.models[this.state.list] == 'ENG_RIG' && <Tab label="Debug" />}
                    </Tabs>
                    <div hidden={this.state.tab != 0}>
                        <AddRemoveTab
                            addMiner={this.props.addMiner}
                            delMiner={this.props.delMiner}
                            blacklist={this.props.blacklist}
                            saveMiners={this.props.saveMiners}
                            loadMiners={this.props.loadMiners}
                            list={this.state.list}
                            data={this.props.data}
                            models={this.state.models}
                            selected={selected}
                            select={this.select}
                            notify={this.props.notify}
                        />
                    </div>
                    <div hidden={this.state.tab != 1}>
                        <ControlTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div hidden={this.state.tab != 2}>
                        <CoinTab
                            handleApi={this.props.handleApi}
                            list={this.state.list}
                            disabled={!capApi}
                            selected={selected}
                            data={this.props.data}
                            miners={miners}
                            models={this.state.models}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div hidden={this.state.tab != 3}>
                        <PerformanceTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            miners={miners}
                            data={this.props.data}
                            list={this.state.list}
                            models={this.state.models}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div hidden={this.state.tab != 4}>
                        <SystemTab
                            handleApi={this.props.handleFormApi}
                            selected={selected}
                            sessionPass={this.props.sessionPass}
                            drawerOpen={this.props.drawerOpen}
                        />
                    </div>
                    <div hidden={this.state.tab != 5}>
                        <FanTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            disabled={!capApi}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div hidden={this.state.tab != 6}>
                        <DebugTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            notify={this.props.notify}
                            data={this.props.data}
                            disabled={!eng_rig}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
