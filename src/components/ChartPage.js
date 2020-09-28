import React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import {Tab, Tabs} from '@blueprintjs/core'

am4core.useTheme(am4themes_animated);

const electron = window.require('electron')

class ChartPage extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            pageState: 'loading',
            chartData: []
        }
        this.chartGetterHandler = this.chartGetterHandler.bind(this);
    }

    chartGetterHandler(event, args){
        let chart = am4core.create("chartdiv", am4charts.XYChart);
        //chart code
        console.log(args)
        chart.data = args;
        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.title.text = "Time"
        //todo use a baseinterval
        let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "Hashrate"
        let series = chart.series.push(new am4charts.LineSeries());
        series.name = "Hashrate"
        series.dataFields.valueY = "hashrate"
        series.dataFields.dateX = "time"

        this.chart = chart
        this.setState({pageState: 'loaded'})
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-chart')
        electron.ipcRenderer.on('get-chart-reply', this.chartGetterHandler)

        if (this.chart) {
            this.chart.dispose()
        }
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-chart-reply', this.chartGetterHandler)
    }

    //todo add a .css to improve performance instead of inlining the style
    render () {
        return (
            <div>
                <div id="chartdiv" style={{ width: "100%", height: "500px"}} />
                <Tabs id="ChartTabs">
                    <Tab id="min15" title="15 min"/>
                    <Tab id="hr3"   title="3 hr"/>
                    <Tab id="hr12"  title="12 hr"/>
                    <Tab id="hr48"  title="48 hr"/>
                </Tabs>
            </div>
        );
    }
}

export default ChartPage;
