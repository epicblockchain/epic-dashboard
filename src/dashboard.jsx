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
                hashrateData[sample.Timestamp] = sample.Hashrate;
            })
        });
        console.log(hashrateData);

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
