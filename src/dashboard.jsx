import * as React from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

am4core.useTheme(am4themes_animated);

function createData(model, totalHashrate, activeMinerCount, acceptedRejectedString, timeSince) {
    return { model, totalHashrate, activeMinerCount, acceptedRejectedString, timeSince };
}

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let chart = am4core.create("chartdiv", am4charts.XYChart);
        let hashrateData = {};
        this.props.data.forEach(miner => {
            try{
                if (miner.hist){
                    miner.hist.forEach(sample => {
                        if (!(sample.Timestamp in hashrateData)) {
                            hashrateData[sample.Timestamp] = sample.Hashrate;
                        } else {
                            hashrateData[sample.Timestamp] += sample.Hashrate;
                        }
                    });    
                }
            } catch (err) {
                console.log(err);
                console.log(this.props.data);
            }
        });
        let chartHashrateData = [];
        for (const seconds in hashrateData) {
            chartHashrateData.push({
                "time": new Date(seconds * 1000),
                "hashrate": hashrateData[seconds] / 1000000
            });
        }

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        yAxis.title.text = "Hashrate (TH/s)";
        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "hashrate";
        series.dataFields.dateX = "time";
        series.name = "Hashrate";
        series.strokeWidth = 2;
        series.smoothing = "monotoneX";
        series.tooltipText = "Hashrate (TH/s): [bold]{valueY}[/]";

        // let bullet = series.bullets.push(new am4charts.CircleBullet());
        // bullet.scale = 0.6;
        // bullet.fill = am4core.color("1b1d4d");

        chart.data = chartHashrateData;
        this.chart = chart;
    }

    componentWillUnmount(){
        if (this.chart) {
            this.chart.dispose();
        }
    }

    getRows(){
        //one for each type of miner
        let modelData = {};
        //check for no miners
        if (this.props.data.length < 1) {
            return [createData('','',0,'','')];
        }

        this.props.data.forEach(miner => {
            if (!(miner.sum.Mining.Algorithm in modelData)) {
                modelData[miner.sum.Mining.Algorithm] = [];
            }
            modelData[miner.sum.Mining.Algorithm].push(miner.sum);
        });

        console.log(modelData);

        let rows = [];
        for (algo in modelData) {
            let totalHashrate = 0;
            let activeMinerCount = 0;
            let acceptedCount = 0;
            let rejectedCount = 0;
            let timeSince = null;

            modelData[algo].forEach(miner => {
                totalHashrate += miner.sum["Average MHs"];
                activeMinerCount += 1;
                acceptedCount += miner.sum["Accepted"];
                rejectedCount += miner.sum["Rejected"];
                if (!timeSince) {
                    timeSince = miner.sum["Last Accepted Share Timestamp"];
                } else if (timeSince < miner.sum["Last Accepted Share Timestamp"]) {
                    timeSince = miner.sum["Last Accepted Share Timestamp"];
                }
            });

            rows.push(createData(
                algo,
                totalHashrate,
                activeMinerCount,
                `${acceptedCount} / ${rejectedCount}`,
                new Date(timeSince * 1000)
            ));
        }

        return rows;
    }

    render() {

        return (
            <div>
                <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell>Miners</TableCell>
                            <TableCell align="right">Total Hashrate</TableCell>
                            <TableCell align="right">Active Miners</TableCell>
                            <TableCell align="right">Accepted / Rejected Shares</TableCell>
                            <TableCell align="right">Time Since Last Share Submitted</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {this.getRows().map((row) => (
                            <TableRow key={row.model}>
                            <TableCell component="th" scope="row">
                                {row.model}
                            </TableCell>
                            <TableCell align="right">{row.totalHashrate}</TableCell>
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
