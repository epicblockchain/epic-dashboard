import * as React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

// import { makeStyles } from '@mui/material/styles'; // not sure how or why to use this
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {buildHashrateSeries} from './dashboardData.mjs';

am4core.useTheme(am4themes_animated);

function createData(model, totalHashrate, totalPower, activeMinerCount, acceptedRejectedString, timeSince) {
    return {model, totalHashrate, totalPower, activeMinerCount, acceptedRejectedString, timeSince};
}

function formatHashrateString(totalHashrate) {
    if (totalHashrate < 1000) {
        return `${totalHashrate.toFixed(2)} H/s`;
    } else if (totalHashrate < 1e6) {
        return `${(totalHashrate / 1e3).toFixed(2)} kH/s`;
    } else if (totalHashrate < 1e9) {
        return `${(totalHashrate / 1e6).toFixed(2)} MH/s`;
    } else if (totalHashrate < 1e12) {
        return `${(totalHashrate / 1e9).toFixed(2)} GH/s`;
    } else if (totalHashrate < 1e15) {
        return `${(totalHashrate / 1e12).toFixed(2)} TH/s`;
    } else {
        return `${(totalHashrate / 1e15).toFixed(2)} PH/s`;
    }
}

function formatPowerString(totalPower) {
    if (totalPower < 1000) {
        return `${totalPower.toFixed(0)} W`;
    } else if (totalPower < 1e6) {
        return `${(totalPower / 1e3).toFixed(2)} kW`;
    } else {
        return `${(totalPower / 1e6).toFixed(2)} MW`;
    }
}

function isSameData(a, b) {
    if (a.numMiners !== b.numMiners) {
        return false;
    } else if (a.totalHistHashrateSum !== b.totalHistHashrateSum) {
        return false;
    }
    return true;
}

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numMiners: 0,
            totalHistHashrateSum: 0,
        };
    }

    componentDidMount() {
        const chart = am4core.create('chartdiv', am4charts.XYChart);
        const {chartHashrateData, totalHashrate} = buildHashrateSeries(this.props.data);

        const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        yAxis.title.text = 'Hashrate (TH/s)';
        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = 'hashrate';
        series.dataFields.dateX = 'time';
        series.name = 'Hashrate';
        series.strokeWidth = 2;
        series.smoothing = 'monotoneX';
        series.fillOpacity = 0.6;
        yAxis.title.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
        yAxis.renderer.labels.template.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
        yAxis.renderer.grid.template.stroke = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#ffffff');
        yAxis.renderer.grid.template.strokeOpacity = 0.4;
        dateAxis.renderer.labels.template.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
        dateAxis.renderer.grid.template.stroke = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#ffffff');
        dateAxis.renderer.grid.template.strokeOpacity = 0.4;

        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.scale = 0.8;
        bullet.fill = am4core.color('#2FC1DE');
        bullet.tooltipText = 'Hashrate: [bold]{valueY} TH/s[/]';
        series.tooltip.getFillFromObject = false;
        series.tooltip.label.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
        series.tooltip.background.fill = am4core.color(this.props.theme == 'light' ? '#fafafa' : '#515151');
        series.tooltip.background.stroke = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');

        chart.data = chartHashrateData;
        this.chart = chart;
        this.setState({
            numMiners: Array.isArray(this.props.data) ? this.props.data.length : 0,
            totalHistHashrateSum: totalHashrate,
        });
    }

    componentDidUpdate(oldProps) {
        const {chartHashrateData, totalHashrate} = buildHashrateSeries(this.props.data);
        const numMiners = Array.isArray(this.props.data) ? this.props.data.length : 0;

        if (!isSameData(this.state, {numMiners, totalHistHashrateSum: totalHashrate})) {
            this.chart.data = chartHashrateData;
            this.setState({
                numMiners,
                totalHistHashrateSum: totalHashrate,
            });
        }

        const yAxes = this.chart.yAxes.values;
        const dateAxes = this.chart.xAxes.values;
        const series = this.chart.series.values;

        if (yAxes?.length && dateAxes?.length && series?.length) {
            yAxes[0].title.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
            yAxes[0].renderer.labels.template.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
            yAxes[0].renderer.grid.template.stroke = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#ffffff');
            dateAxes[0].renderer.labels.template.fill = am4core.color(
                this.props.theme == 'light' ? '#0068B4' : '#2FC1DE',
            );
            dateAxes[0].renderer.grid.template.stroke = am4core.color(
                this.props.theme == 'light' ? '#0068B4' : '#ffffff',
            );
            series[0].tooltip.label.fill = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#fafafa');
            series[0].tooltip.background.fill = am4core.color(this.props.theme == 'light' ? '#fafafa' : '#515151');
            series[0].tooltip.background.stroke = am4core.color(this.props.theme == 'light' ? '#0068B4' : '#2FC1DE');
        }
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    getRows() {
        //one for each type of miner
        const modelData = Object.create(null);
        //check for no miners
        if (this.props.data.length < 1) {
            return [createData('', '', 0, '', '')];
        }

        this.props.data.forEach((miner) => {
            const summary = miner?.sum;
            const algorithm = summary?.Mining?.Algorithm;
            if (
                typeof algorithm === 'string' &&
                summary.Session &&
                typeof summary.Session === 'object' &&
                Array.isArray(summary.HBs) &&
                summary.HBs.every((hashboard) => hashrateBoardIsObject(hashboard))
            ) {
                if (!modelData[algorithm]) modelData[algorithm] = [];
                modelData[algorithm].push(summary);
            }
        });

        const rows = [];
        for (const algo of Object.keys(modelData)) {
            let totalHashrate = 0;
            let totalPower = 0;
            let activeMinerCount = 0;
            let acceptedCount = 0;
            let rejectedCount = 0;
            let timeSince = null;

            modelData[algo].forEach((miner) => {
                totalHashrate += Number(miner['Session']['Average MHs']) || 0;
                miner['HBs'].forEach((hb) => {
                    totalPower += Number(hb['Input Power']) || 0;
                });
                activeMinerCount += 1;
                acceptedCount += Number(miner['Session']['Accepted']) || 0;
                rejectedCount += Number(miner['Session']['Rejected']) || 0;
                if (!timeSince) {
                    timeSince = miner['Session']['Last Accepted Share Timestamp'];
                } else if (timeSince < miner['Session']['Last Accepted Share Timestamp']) {
                    timeSince = miner['Session']['Last Accepted Share Timestamp'];
                }
            });

            rows.push(
                createData(
                    algo,
                    formatHashrateString(totalHashrate * 1e6),
                    formatPowerString(totalPower),
                    activeMinerCount,
                    `${acceptedCount} / ${rejectedCount}`,
                    new Date(timeSince * 1000).toString(),
                ),
            );
        }

        return rows;
    }

    render() {
        return (
            <div>
                <div id="chartdiv" style={{width: '100%', height: '500px'}}></div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Algorithm</TableCell>
                                <TableCell align="right">Total Hashrate</TableCell>
                                <TableCell align="right">Total Power</TableCell>
                                <TableCell align="right">Active Miners</TableCell>
                                <TableCell align="right">Accepted / Rejected Shares</TableCell>
                                <TableCell align="right">Last Share Submission Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.getRows().map((row) => (
                                <TableRow key={row.model}>
                                    <TableCell component="th" scope="row">
                                        {row.model}
                                    </TableCell>
                                    <TableCell align="right">{row.totalHashrate}</TableCell>
                                    <TableCell align="right">{row.totalPower}</TableCell>
                                    <TableCell align="right">{row.activeMinerCount}</TableCell>
                                    <TableCell align="right">{row.acceptedRejectedString}</TableCell>
                                    <TableCell align="right">{row.timeSince}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

function hashrateBoardIsObject(hashboard) {
    return Boolean(hashboard && typeof hashboard === 'object');
}
