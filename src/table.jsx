import * as React from 'react';
import {Tabs, Tab, Paper} from '@mui/material';
import {AddRemoveTab} from './tabs/AddRemoveTab.jsx';
import {CoinTab} from './tabs/CoinTab.jsx';
import {DisableBoardOnFailureTab} from './tabs/DisableBoardOnFailureTab.jsx';
import {EnableBoardsOnIdleTab} from './tabs/EnableBoardsOnIdleTab.jsx';
import {IdleOnConnectionLostTab} from './tabs/IdleOnConnectionLostTab.jsx';
import {PerformanceTab} from './tabs/PerformanceTab.jsx';
import {SystemTab} from './tabs/SystemTab.jsx';
import {ControlTab} from './tabs/ControlTab.jsx';
import {BoardControlTab} from './tabs/BoardControlTab.jsx';
import {FanTab} from './tabs/FanTab.jsx';
import {TuneTab} from './tabs/TuneTab.jsx';
import {DebugTab} from './tabs/DebugTab.jsx';
import {WifiTab} from './tabs/WifiTab.jsx';
import {PerpetualtuneTab} from './tabs/PerpetualtuneTab.jsx';
import {LicenseTab} from './tabs/LicenseTab.jsx';
import './table.css';

import Table, {tableColumnIds} from './customTable.jsx';
import {getOrderedSelectedMiners} from './minerTable.mjs';

export const DEFAULT_HIDDEN_COLUMNS = [
    'name',
    'mode',
    'model',
    'start',
    'perpetualtuneminthrottle',
    'perpetualtunethrottlestep',
    'shutdowntemp',
    'criticaltemp',
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
    'mac',
    'fansrpm',
];

const LEGACY_DEFAULT_HIDDEN_COLUMNS = [
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
    'mac',
    'fansrpm',
];

const DEFAULT_HIDDEN_COLUMN_SET = new Set(DEFAULT_HIDDEN_COLUMNS);
const AVAILABLE_COLUMNS = new Set(tableColumnIds);

function hasSameColumns(first = [], second = []) {
    return first.length === second.length && first.every((columnId) => second.includes(columnId));
}

function getColumnOrder(tablePreferences = {}) {
    const seenColumns = new Set();
    const columnOrder = Array.isArray(tablePreferences.__columnOrder)
        ? tablePreferences.__columnOrder
        : tablePreferences.columnOrder;

    if (!Array.isArray(columnOrder)) {
        return [];
    }

    return columnOrder.filter((columnId) => {
        if (!AVAILABLE_COLUMNS.has(columnId) || seenColumns.has(columnId)) {
            return false;
        }

        seenColumns.add(columnId);
        return true;
    });
}

function getHiddenColumns(tablePreferences = {}) {
    if (Array.isArray(tablePreferences.hiddenColumns)) {
        const hiddenColumns = tablePreferences.hiddenColumns.filter((columnId) => AVAILABLE_COLUMNS.has(columnId));

        // Apply newly introduced defaults to an untouched pre-migration preference file while
        // preserving any explicit customizations.
        if (hasSameColumns(hiddenColumns, LEGACY_DEFAULT_HIDDEN_COLUMNS)) {
            return tableColumnIds.filter(
                (columnId) => hiddenColumns.includes(columnId) || DEFAULT_HIDDEN_COLUMN_SET.has(columnId),
            );
        }

        return hiddenColumns;
    }

    return tableColumnIds.filter(
        (columnId) =>
            tablePreferences[columnId] === false ||
            (tablePreferences[columnId] !== true && DEFAULT_HIDDEN_COLUMN_SET.has(columnId)),
    );
}

function getColumnSizing(tablePreferences = {}) {
    if (!tablePreferences.columnSizing || typeof tablePreferences.columnSizing !== 'object') {
        return {};
    }

    return Object.fromEntries(
        Object.entries(tablePreferences.columnSizing).filter(
            ([columnId, size]) => AVAILABLE_COLUMNS.has(columnId) && Number.isFinite(size) && size > 0,
        ),
    );
}

function getSorting(tablePreferences = {}) {
    if (!Array.isArray(tablePreferences.sorting)) {
        return [];
    }

    return tablePreferences.sorting.filter(
        (sort) => sort && AVAILABLE_COLUMNS.has(sort.id) && typeof sort.desc === 'boolean',
    );
}

function getColumnFilters(tablePreferences = {}) {
    if (!Array.isArray(tablePreferences.columnFilters)) {
        return [];
    }

    return tablePreferences.columnFilters.filter(
        (filter) => filter && AVAILABLE_COLUMNS.has(filter.id) && filter.value !== undefined,
    );
}

function getSharedTableState(tablePreferences = {}) {
    return {
        hiddenColumns: getHiddenColumns(tablePreferences),
        columnOrder: getColumnOrder(tablePreferences),
        columnSizing: getColumnSizing(tablePreferences),
        sorting: getSorting(tablePreferences),
        columnFilters: getColumnFilters(tablePreferences),
    };
}

export function normalizeTablePreferences(tablePreferences = {}) {
    return {
        hiddenColumns: getHiddenColumns(tablePreferences),
        __columnOrder: getColumnOrder(tablePreferences),
        columnSizing: getColumnSizing(tablePreferences),
        sorting: getSorting(tablePreferences),
        columnFilters: getColumnFilters(tablePreferences),
    };
}

function getPersistedTable(tableState = {}) {
    return normalizeTablePreferences({
        hiddenColumns: tableState.hiddenColumns,
        __columnOrder: tableState.columnOrder,
        columnSizing: tableState.columnSizing,
        sorting: tableState.sorting,
        columnFilters: tableState.columnFilters,
    });
}

function debounce1(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, timeout);
    };
}

export class DataTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {models: ['Miners Loading...'], selected: {}, list: 0, tab: 'home', reset: false};

        this.select = this.select.bind(this);
        this.setList = this.setList.bind(this);
        this.setTab = this.setTab.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        window.onresize = debounce1(() => this.forceUpdate());

        if (this.props.models && this.props.models.length) {
            const newState = {models: this.props.models};
            this.props.models.forEach((key) => {
                newState[key + '_sel'] = [];
                newState[key + '_state'] = {};
            });

            this.setState(newState);
        }
    }

    selectReset() {
        const newState = {reset: true};
        this.props.models.forEach((key) => {
            newState[key + '_sel'] = [];
        });

        this.setState(newState);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.models != this.props.models) {
            const newModels = this.props.models.filter((x) => !prevProps.models.includes(x));
            const newState = {models: this.props.models};
            newModels.forEach((key) => {
                newState[key + '_sel'] = [];
                newState[key + '_state'] = {};
            });

            this.setState(newState);
        }

        if (this.state.reset) this.setState({reset: false});
    }

    hashrate_x_hr(row, x, noFormat) {
        let sum = 0;
        if (x) {
            try {
                if (row.hist.length < x) {
                    sum = 'N/A';
                } else {
                    for (const obj of row.hist.slice(-x)) {
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
        const raw = this.hashrate_x_hr(row, 1, true) / this.totalPower(row.sum);
        if (isNaN(raw)) return 'N/A';
        return `${Math.round(raw / 10) / 100} GH/W`;
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
        let sum;
        sum = volt.reduce((total, num) => {
            return total + num;
        }, 0);
        sum = sum / data.length;
        return Math.round((sum + Number.EPSILON) * 100) / 100;
    }

    avgClock(data, cap) {
        const totals = [];
        for (const hb of Object.keys(data || {})) {
            totals.push(String(data[hb]['Core Clock Avg']));
        }

        if (cap == null) {
            return 'N/A';
        } else {
            if (totals.length == 0 || cap['Max HBs'] == null) {
                return 'N/A';
            } else {
                let text = '';
                let count = 0;
                for (let i = 0; i + count < cap['Max HBs']; i++) {
                    if (totals[i] == undefined) {
                        text += (String(i + count) + ': ' + 'N/A').padEnd(10);
                    } else {
                        if (data[i].Index !== i + count) {
                            text += (String(i + count) + ': ' + 'N/A').padEnd(10);
                            count++;
                            i--;
                        } else {
                            text += (String(i + count) + ': ' + String(parseFloat(totals[i]).toFixed(1))).padEnd(10);
                        }
                    }
                    if (i + 1 + count < cap['Max HBs']) {
                        text += '| ';
                    }
                }
                return text;
            }
        }
    }

    totalPower(summary) {
        let power = summary['Power Supply Stats']?.['Input Power'];

        if (!power) {
            const hb_power = summary.HBs.map((hb) => hb['Input Power']);
            power = hb_power.reduce((total, num) => {
                return total + num;
            }, 0);
        }
        return Math.round(power);
    }

    activeHBs(hbs) {
        if (hbs.length < 3) {
            const active = hbs.map((a) => a.Index);

            return `${active.length} (${active.join(', ')})`;
        }
        return hbs.length;
    }

    perpetualtune(data) {
        if (data.PerpetualTune == undefined || data.PerpetualTune == null) {
            return 'N/A';
        } else {
            if (data.PerpetualTune.Running) {
                return 'Enabled';
            } else {
                return 'Disabled';
            }
        }
    }

    perpetualtuneAlgo(data) {
        if (data.PerpetualTune == undefined || data.PerpetualTune == null) {
            return 'N/A';
        } else {
            for (const i of Object.keys(data.PerpetualTune.Algorithm || {})) {
                return i;
            }
        }
    }

    perpetualtuneOptimized(data) {
        if (data.PerpetualTune == undefined || data.PerpetualTune == null) {
            return 'N/A';
        } else {
            for (const i of Object.keys(data.PerpetualTune.Algorithm || {})) {
                return data.PerpetualTune.Algorithm[i].Optimized.toString();
            }
        }
    }

    perpetualtuneTarget(data) {
        if (data.PerpetualTune == undefined || data.PerpetualTune == null) {
            return {value: 'N/A', tooltip: null};
        } else {
            for (const i of Object.keys(data.PerpetualTune.Algorithm || {})) {
                const algo = data.PerpetualTune.Algorithm[i];
                const target = algo.Target;
                const throttleTarget = algo['Throttle Target'];
                const errorThrottleTarget = algo['Error Throttle Target'];
                const unit = algo.Unit;

                let displayValue;
                let tooltip = null;

                if (throttleTarget != undefined && throttleTarget != null) {
                    displayValue = `${target} (${throttleTarget})`;
                } else {
                    displayValue = target;
                }

                if (errorThrottleTarget != undefined && errorThrottleTarget != null) {
                    const unitText = unit != null ? ` ${unit}` : '';
                    tooltip =
                        `A chip or PSU error was detected that triggered a throttle to maintain stability. ` +
                        `The chips may not be stable at higher hashrates or the PSU may have overheated. ` +
                        `The rig will not throttle back up beyond ${errorThrottleTarget} ${unitText} automatically. ` +
                        `In order to clear the error throttle target, reset Perpetual Tune.`;
                }

                return {value: displayValue, tooltip};
            }
        }
    }

    shutdowntemp(data) {
        if (data.Misc == null) {
            return 'N/A';
        } else {
            return data.Misc['Shutdown Temp'] + ' °C';
        }
    }
    critialtemp(data) {
        if (data.Misc == null) {
            return 'N/A';
        } else {
            return data.Misc['Critical Temp'] + ' °C';
        }
    }

    fansrpm(fansrpm) {
        if (fansrpm) {
            return (
                'Fan 1' +
                ': ' +
                String(fansrpm['Fans Speed 1']) +
                ' | ' +
                'Fan 2' +
                ': ' +
                String(fansrpm['Fans Speed 2']) +
                ' | ' +
                'Fan 3' +
                ': ' +
                String(fansrpm['Fans Speed 3']) +
                ' | ' +
                'Fan 4' +
                ': ' +
                String(fansrpm['Fans Speed 4'])
            );
        } else {
            return 'N/A';
        }
    }
    hbperformance(hashrate, cap) {
        const totals = [];
        if (hashrate.length > 0) {
            for (const hb in hashrate) {
                if (hashrate[hb].Hashrate !== undefined) {
                    totals.push(String(hashrate[hb].Hashrate[1]));
                }
            }
        }
        if (cap == null) {
            return 'N/A';
        } else {
            if (totals.length == 0 || cap['Max HBs'] == null) {
                return 'N/A';
            } else {
                let text = '';
                let count = 0;
                for (let i = 0; i + count < cap['Max HBs']; i++) {
                    if (hashrate[i] == undefined) {
                        text += (String(i + count) + ': ' + 'N/A').padEnd(10);
                    } else {
                        if (hashrate[i].Index !== i + count) {
                            text += (String(i + count) + ': ' + 'N/A').padEnd(10);
                            count++;
                            i--;
                        } else {
                            text += (String(i + count) + ': ' + String(parseFloat(totals[i]).toFixed(1)) + '%').padEnd(
                                10,
                            );
                            if (parseFloat(totals[i]) < 100) {
                                text += ' ';
                            }
                        }
                    }
                    if (i + 1 + count < cap['Max HBs']) {
                        text += '| ';
                    }
                }
                return text;
            }
        }
    }

    getLowest(hashrate) {
        const totals = [];
        if (hashrate.length > 0) {
            for (const hb in hashrate) {
                if (hashrate[hb].Hashrate !== undefined) {
                    totals.push(String(hashrate[hb].Hashrate[1]));
                }
            }
        }
        if (totals.length == 0) {
            return 0;
        } else {
            return Math.min(...totals);
        }
    }

    realtime_hashrate(hashrate, cap) {
        let total = 0;
        if (cap == null) {
            return 'N/A';
        } else {
            if (cap['Max HBs'] == null) {
                return 'N/A';
            } else {
                for (const hb of Object.keys(hashrate || {})) {
                    total += hashrate[hb].Hashrate[0];
                }
            }
        }
        return String((total / 1e6).toFixed(2)) + ' TH/s';
    }

    select(sel_model, model) {
        this.setState((state) => ({
            [model + '_sel']: sel_model,
            [model + '_state']: sel_model.length
                ? state[model + '_state']
                : {...state[model + '_state'], rowSelection: {}},
        }));
    }

    setList(event, newVal) {
        this.setState({list: newVal});
        this.setState({tab: 'home'});
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
        const {hiddenColumns, columnOrder, ...nextModelState} = newState;

        if (
            action.type == 'toggleHideColumn' ||
            action.type == 'toggleHideAllColumns' ||
            action.type == 'setColumnOrder' ||
            action.type == 'setColumnSizing' ||
            action.type == 'setSorting' ||
            action.type == 'setColumnFilters'
        ) {
            this.props.saveDefault(getPersistedTable(newState));
            this.setState({[model + '_state']: nextModelState});
        } else if (action.type === 'rowSelection') {
            const sel = getOrderedSelectedMiners(this.state[model + '_sel'] || [], newState.rowSelection, data);
            this.setState({[model + '_sel']: sel, [model + '_state']: nextModelState});
        } else {
            this.setState({[model + '_state']: nextModelState});
        }
    }

    getLastError(a) {
        const x = a.sum.Status['Last Error'];
        if (x === null || x === undefined) {
            return ' ';
        } else {
            return Object.values(a.sum.Status['Last Error']);
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
                (a.sum.PresetInfo ? `${a.sum.PresetInfo.Preset} @ ${a.sum.PresetInfo['Target Power']}W` : a.sum.Preset),
            pool: this.failSafe(a.sum) || a.sum.Stratum['Current Pool'],
            user: this.failSafe(a.sum) || a.sum.Stratum['Current User'],
            start: this.failSafe(a.sum) || a.sum.Session['Startup Timestamp'],
            uptime: this.failSafe(a.sum) || this.secondsToHumanReadable(a.sum.Session.Uptime),
            hbs: this.failSafe(a.sum) || this.activeHBs(a.sum.HBs),
            perpetualtune: this.failSafe(a.sum) || this.perpetualtune(a.sum),
            perpetualtunealgo: this.failSafe(a.sum) || this.perpetualtuneAlgo(a.sum),
            perpetualtuneoptimized: this.failSafe(a.sum) || this.perpetualtuneOptimized(a.sum),
            perpetualtunetarget: this.failSafe(a.sum)
                ? {value: this.failSafe(a.sum), tooltip: null}
                : this.perpetualtuneTarget(a.sum),
            perpetualtuneminthrottle:
                this.failSafe(a.sum) ||
                Object.values(a.sum?.PerpetualTune?.Algorithm || {})[0]?.['Min Throttle Target'] ||
                'N/A',
            perpetualtunethrottlestep:
                this.failSafe(a.sum) ||
                Object.values(a.sum?.PerpetualTune?.Algorithm || {})[0]?.['Throttle Step'] ||
                'N/A',
            shutdowntemp: this.failSafe(a.sum) || this.shutdowntemp(a.sum),
            criticaltemp: this.failSafe(a.sum) || this.critialtemp(a.sum),
            performance: this.failSafe(a.sum) || this.hbperformance(a.sum.HBs, a.cap),
            lowest: this.failSafe(a.sum) || this.getLowest(a.sum.HBs),
            realtimehashrate: this.failSafe(a.sum) || this.realtime_hashrate(a.sum.HBs, a.cap),
            hashrate15min: this.failSafe(a.sum) || this.hashrate_x_hr(a, null, false),
            hashrate1hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 1, false),
            hashrate6hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 6, false),
            hashrate24hr: this.failSafe(a.sum) || this.hashrate_x_hr(a, 24, false),
            efficiency1hr: this.failSafe(a.sum) || this.efficiency(a),
            accepted: this.failSafe(a.sum) || a.sum.Session.Accepted,
            rejected: this.failSafe(a.sum) || a.sum.Session.Rejected,
            difficulty: this.failSafe(a.sum) || a.sum.Session.Difficulty,
            temperature: this.failSafe(a.sum) || this.maxTemp(a.sum.HBs).toFixed(1) + ' \u00b0C',
            power: this.failSafe(a.sum) || this.totalPower(a.sum),
            fanspeed: this.failSafe(a.sum) || a.sum.Fans['Fans Speed'],
            cap: a.cap,
            voltage: this.failSafe(a.sum) || this.avgVoltage(a.sum.HBs),
            clock: this.failSafe(a.sum) || this.avgClock(a.sum.HBs, a.cap),
            status: this.failSafe(a.sum) || (a.sum.Status ? a.sum.Status['Operating State'] : 'N/A'),
            misc: this.failSafe(a.sum) || a.sum.Misc,
            connected:
                this.failSafe(a.sum) ||
                (a.sum.Stratum.IsPoolConnected !== undefined ? a.sum.Stratum.IsPoolConnected : 'Error'),
            lasterror:
                this.failSafe(a.sum) || (a.sum.Status && a.sum.Status['Last Error'] ? this.getLastError(a) : ' '),
            mac: this.failSafe(a.sum) || a.network?.dhcp?.mac_address || a.network?.static?.mac_address || ' ',
            fansrpm: this.failSafe(a.sum) || this.fansrpm(a.sum['Fans Rpm']),
        }));

        const miners = {};

        for (const row of rows) {
            if (row.cap) {
                if (miners[row.model]) miners[row.model].push(row);
                else miners[row.model] = [row];
            } else miners['undefined'] ? miners['undefined'].push(row) : (miners['undefined'] = [row]);
        }

        const activeModel = this.state.models[this.state.list];
        const activeTableState = this.state[activeModel + '_state'] || {};
        let selected = getOrderedSelectedMiners([], activeTableState.rowSelection || {}, miners[activeModel] || []);

        let capApi = true;
        let eng_rig = true;
        for (const i of selected) {
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
                    className="model-tabs"
                    value={this.state.list}
                    onChange={this.setList}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    aria-label="Miner models"
                >
                    {this.state.models.map((model) => {
                        return <Tab className="miner-model-tab" key={model} label={model} />;
                    })}
                </Tabs>
                <canvas id="canvas" hidden></canvas>
                <div className="table-region">
                    {this.state.models.map((model, i) => {
                        return this.props.defaultTableLoaded && this.state.list == i ? (
                            <Paper
                                variant="outlined"
                                className="datatable-wrap"
                                style={{width: '100%', overflow: 'hidden'}}
                                key={model}
                            >
                                <Table
                                    dataRaw={miners[model] || []}
                                    extstate={{
                                        ...this.state[model + '_state'],
                                        ...getSharedTableState(this.props.defaultTable),
                                    }}
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
                <div className="settings-region">
                    <Tabs
                        value={this.state.tab}
                        onChange={this.setTab}
                        indicatorColor="primary"
                        textColor="primary"
                        scrollButtons="auto"
                        variant="scrollable"
                    >
                        <Tab value="home" label="Home" />
                        <Tab value="control" label="Miner Control" />
                        <Tab value="mining-config" label="Mining Config" disabled={!capApi} />
                        <Tab value="system" label="System" />
                        {this.props.tunecap.includes(this.state.models[this.state.list].toLocaleLowerCase()) && (
                            <Tab value="perpetual-tune" label="Perpetual Tune" />
                        )}
                        <Tab value="cooling" label="Cooling" disabled={!capApi} />
                        <Tab value="board-control" label="Board Control" />
                        {this.props.tunecap.includes(this.state.models[this.state.list].toLocaleLowerCase()) && (
                            <Tab value="tune" label="Tune" />
                        )}
                        <Tab value="performance" label="Performance" />
                        {this.props.tunecap.includes(this.state.models[this.state.list].toLocaleLowerCase()) && (
                            <Tab value="enable-boards-on-idle" label="Enable Boards on Idle" />
                        )}
                        {this.props.tunecap.includes(this.state.models[this.state.list].toLocaleLowerCase()) && (
                            <Tab value="idle-on-connection-lost" label="Idle on Connection Lost" />
                        )}
                        {this.props.tunecap.includes(this.state.models[this.state.list].toLocaleLowerCase()) && (
                            <Tab value="disable-board-on-fail" label="Disable Board on Fail" />
                        )}
                        {this.props.tunecap.includes(this.state.models[this.state.list].toLocaleLowerCase()) && (
                            <Tab value="license" label="License" />
                        )}
                        {this.state.models[this.state.list].toLowerCase() == 'eng_rig' && (
                            <Tab value="wifi" label="Wi-Fi" />
                        )}
                        {this.state.models[this.state.list].toLowerCase() == 'eng_rig' && (
                            <Tab value="debug" label="Debug" />
                        )}
                    </Tabs>
                    <div className="settings-panel" hidden={this.state.tab != 'home'}>
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
                    <div className="settings-panel" hidden={this.state.tab != 'control'}>
                        <ControlTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'mining-config'}>
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
                    <div className="settings-panel" hidden={this.state.tab != 'performance'}>
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
                    <div className="settings-panel" hidden={this.state.tab != 'system'}>
                        <SystemTab
                            handleApi={this.props.handleApi}
                            handleFormApi={this.props.handleFormApi}
                            selected={selected}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'cooling'}>
                        <FanTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            data={this.props.data}
                            disabled={!capApi}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'tune'}>
                        <TuneTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            data={this.props.data}
                            disabled={!capApi}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'perpetual-tune'}>
                        <PerpetualtuneTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            data={this.props.data}
                            disabled={!capApi}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'board-control'}>
                        <BoardControlTab
                            handleApi={this.props.handleApi}
                            selected={selected}
                            data={this.props.data}
                            model={this.state.models[this.state.list]}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'idle-on-connection-lost'}>
                        <IdleOnConnectionLostTab
                            handleApi={this.props.handleApi}
                            disabled={!capApi}
                            selected={selected}
                            models={this.state.models}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'disable-board-on-fail'}>
                        <DisableBoardOnFailureTab
                            handleApi={this.props.handleApi}
                            disabled={!capApi}
                            selected={selected}
                            models={this.state.models}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'enable-boards-on-idle'}>
                        <EnableBoardsOnIdleTab
                            handleApi={this.props.handleApi}
                            disabled={!capApi}
                            selected={selected}
                            models={this.state.models}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'license'}>
                        <LicenseTab
                            handleApi={this.props.handleApi}
                            handleFormApi={this.props.handleFormApi}
                            selected={selected}
                            data={this.props.data}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'wifi'}>
                        <WifiTab
                            handleApi={this.props.handleApi}
                            handleFormApi={this.props.handleFormApi}
                            selected={selected}
                            data={this.props.data}
                            sessionPass={this.props.sessionPass}
                        />
                    </div>
                    <div className="settings-panel" hidden={this.state.tab != 'debug'}>
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
