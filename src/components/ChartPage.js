import React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { Button } from '@blueprintjs/core'

import '@blueprintjs/core/lib/css/blueprint.css'
import './ChartPage.css'

am4core.useTheme(am4themes_animated);

const electron = window.require('electron')

class ChartPage extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            pageState: 'loading',
            chartData: [],
            firstAnimation: true,
            scrollX: null,
            scrollY: null
        }
        this.chartGetterHandler = this.chartGetterHandler.bind(this);
        this.handleRefreshChartData = this.handleRefreshChartData.bind(this);
    }

    handleRefreshChartData(){
        if (this.chart) {
            this.chart.dispose()
        }
        electron.ipcRenderer.send('get-chart');
    }

    chartGetterHandler(event, args){
        let chart = am4core.create("chartdiv", am4charts.XYChart);
        //chart code
        chart.data = args;
        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.title.text = "Time"
        //todo use a baseinterval
        let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0
        yAxis.title.text = "Hashrate (TH/s)"
        let series = chart.series.push(new am4charts.StepLineSeries());
        series.name = "Hashrate (TH/s)"
        series.dataFields.valueY = "hashrate"
        series.dataFields.dateX = "time"
        series.strokeWidth = 2;
        series.stroke = am4core.color("#1b1d4d");
        // series.smoothing = "monotoneX"
        if (this.state.firstAnimation) {
            this.setState({firstAnimation: false})
        } else {
            series.showOnInit = false // so that live updating data doesnt look bad
            chart.showOnInit = false
        }
        //hide the logo for now
        chart.logo.height = -15000;
        chart.cursor = new am4charts.XYCursor();
        chart.scrollbarX = new am4charts.XYChartScrollbar();
        chart.scrollbarY = new am4charts.XYChartScrollbar();
        // var bullet = series.bullets.push(new am4charts.CircleBullet());
        // bullet.scale = 0.6;
        // bullet.fill = am4core.color("#1b1d4d");
        this.chart = chart
        this.setState({pageState: 'loaded'})
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-chart')
        electron.ipcRenderer.on('get-chart-reply', this.chartGetterHandler)

    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-chart-reply', this.chartGetterHandler)
        if (this.chart) {
            this.chart.dispose()
        }
    }

    //todo add a .css to improve performance instead of inlining the style
    render () {
        return (
            <div>
                <Button className="refreshChartButton" onClick={this.handleRefreshChartData} icon="refresh"/>
                <div id="chartdiv" style={{ width: "100%", height: "500px"}} />
            </div>
        );
    }
}

export default ChartPage;
