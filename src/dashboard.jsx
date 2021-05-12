import * as React from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

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
                time: new Date(seconds * 1000),
                hashrate: hashrateData[seconds]
            });
        }

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        let series = chart.series.push(new am4charts.LineSeries());

        chart.data = chartHashrateData;

        console.log(chartHashrateData);
        

        this.chart = chart;
    }

    componentWillUnmount(){
        if (this.chart) {
            this.chart.dispose();
        }
    }

    render() {
        return (
            <div>
                
                <div id="chartdiv"></div>

                <h1>Table</h1>
                <ul>
                    {
                        this.props.data.map(function(item, i) {
                            return <li key={i}>{JSON.stringify(item)}</li>
                        })
                    }
                </ul>
            </div>   
        );
    }
}
