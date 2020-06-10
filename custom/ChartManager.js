// class ChartManager {

//     chart;
//     line; //can be an array later

//     constructor(id, delay){
//         this.line = new TimeSeries();
//         this.chart = new SmoothieChart({responsive: true,
//                                         minValue: 0,
//                                         maxValueScale: 1.05,
//                                         millisPerPixel: 50 ,
//                                         labels: {
//                                             showIntermediateLabels: true,
//                                             precision: 0
//                                         }});
//         this.chart.addTimeSeries(this.line, {strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 2});
//         this.chart.streamTo(document.getElementById(id), delay); //delay is optional
//     }


//     pushData(val){
//         this.line.append(Date.now(), val);
//     }

// }