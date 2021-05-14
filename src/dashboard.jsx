import * as React from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// import { makeStyles } from '@material-ui/core/styles';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';

am4core.useTheme(am4themes_animated);

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let chart = am4core.create("chartdiv", am4charts.XYChart);
        
        let hashrateData = {};
        this.props.data.forEach(miner => {
            miner.hist.forEach(sample => {
                if (!(sample.Timestamp in hashrateData)) {
                    hashrateData[sample.Timestamp] = sample.Hashrate;
                } else {
                    hashrateData[sample.Timestamp] += sample.Hashrate;
                }
            });
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

        // this.chart = chart;
    }

    componentWillUnmount(){
        // if (this.chart) {
        //     this.chart.dispose();
        // }
    }

    render() {

        return (
            <div>
                <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
            </div>   
        );
    }
}
