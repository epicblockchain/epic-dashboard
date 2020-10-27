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
        // series.smoothing = "monotoneX"
        if (this.state.firstAnimation) {
            this.setState({firstAnimation: false})
        } else {
            series.showOnInit = false // so that live updating data doesnt look bad
            chart.showOnInit = false
        }
        //unhide the logo
        // chart.logo.height = -15000;
        chart.cursor = new am4charts.XYCursor();
        chart.scrollbarX = new am4charts.XYChartScrollbar();
        chart.scrollbarY = new am4charts.XYChartScrollbar();
        chart.scrollbarX.minHeight = 30;
        chart.scrollbarY.minWidth = 30;
        if (this.props.dark) {
            chart.scrollbarX.startGrip.background.fill        = am4core.color("#1b1d4d");
            chart.scrollbarX.endGrip.background.fill          = am4core.color("#1b1d4d");
            chart.scrollbarX.thumb.background.fill            = am4core.color("#1b1d4d");
            chart.scrollbarX.startGrip.background.stroke      = am4core.color("#1b1d4d");
            chart.scrollbarX.endGrip.background.stroke        = am4core.color("#1b1d4d");
            chart.scrollbarX.thumb.background.stroke          = am4core.color("#1b1d4d");
            chart.scrollbarX.startGrip.background.fillOpacity = 0.8;
            chart.scrollbarX.endGrip.background.fillOpacity   = 0.8;
            chart.scrollbarX.thumb.background.fillOpacity     = 0.8;
            chart.scrollbarX.startGrip.background.states.getKey("hover").properties.fill        = am4core.color("#1b1d4d");
            chart.scrollbarX.endGrip.background.states.getKey("hover").properties.fill          = am4core.color("#1b1d4d");
            chart.scrollbarX.thumb.background.states.getKey("hover").properties.fill            = am4core.color("#1b1d4d");
            chart.scrollbarX.startGrip.background.states.getKey("hover").properties.fillOpacity = 0.8
            chart.scrollbarX.endGrip.background.states.getKey("hover").properties.fillOpacity   = 0.8
            chart.scrollbarX.thumb.background.states.getKey("hover").properties.fillOpacity     = 0.8
            chart.scrollbarX.startGrip.background.states.getKey("down").properties.fill        = am4core.color("#1b1d4d");
            chart.scrollbarX.endGrip.background.states.getKey("down").properties.fill          = am4core.color("#1b1d4d");
            chart.scrollbarX.thumb.background.states.getKey("down").properties.fill            = am4core.color("#1b1d4d");
            chart.scrollbarX.startGrip.background.states.getKey("down").properties.fillOpacity = 0.5
            chart.scrollbarX.endGrip.background.states.getKey("down").properties.fillOpacity   = 0.5
            chart.scrollbarY.thumb.background.states.getKey("down").properties.fillOpacity     = 0.5
            chart.scrollbarY.startGrip.background.fill        = am4core.color("#1b1d4d");
            chart.scrollbarY.endGrip.background.fill          = am4core.color("#1b1d4d");
            chart.scrollbarY.thumb.background.fill            = am4core.color("#1b1d4d");
            chart.scrollbarY.startGrip.background.stroke      = am4core.color("#1b1d4d");
            chart.scrollbarY.endGrip.background.stroke        = am4core.color("#1b1d4d");
            chart.scrollbarY.thumb.background.stroke          = am4core.color("#1b1d4d");
            chart.scrollbarY.startGrip.background.fillOpacity = 0.8;
            chart.scrollbarY.endGrip.background.fillOpacity   = 0.8;
            chart.scrollbarY.thumb.background.fillOpacity     = 0.8;
            chart.scrollbarY.startGrip.background.states.getKey("hover").properties.fill        = am4core.color("#1b1d4d");
            chart.scrollbarY.endGrip.background.states.getKey("hover").properties.fill          = am4core.color("#1b1d4d");
            chart.scrollbarY.thumb.background.states.getKey("hover").properties.fill            = am4core.color("#1b1d4d");
            chart.scrollbarY.startGrip.background.states.getKey("hover").properties.fillOpacity = 0.8
            chart.scrollbarY.endGrip.background.states.getKey("hover").properties.fillOpacity   = 0.8
            chart.scrollbarY.thumb.background.states.getKey("hover").properties.fillOpacity     = 0.8
            chart.scrollbarY.startGrip.background.states.getKey("down").properties.fill        = am4core.color("#1b1d4d");
            chart.scrollbarY.endGrip.background.states.getKey("down").properties.fill          = am4core.color("#1b1d4d");
            chart.scrollbarY.thumb.background.states.getKey("down").properties.fill            = am4core.color("#1b1d4d");
            chart.scrollbarY.startGrip.background.states.getKey("down").properties.fillOpacity = 0.5
            chart.scrollbarY.endGrip.background.states.getKey("down").properties.fillOpacity   = 0.5
            chart.scrollbarY.thumb.background.states.getKey("down").properties.fillOpacity     = 0.5
            series.stroke = am4core.color("#ffc107");
        } else {
            series.stroke = am4core.color("#1b1d4d");
        }
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
