

class ChartManager {

    chart;

    constructor(title, id){
        var el = document.getElementById(id);
        this.chart = new Chart(el, {
          type: 'scatter', //can also be scatter to show x-axis or just change options, for some reason line does not work
          data: {
              datasets: [{
                  label: title,
                  data: [],
                  showLine: true
              }]
          },
          options: {
              responsive: true,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]

                //if we want this functionality we need to use older version of moment and chart js i think

                //   xAxes: [{
                //       type: 'time',
                //       time: {
                //           displayFormats: {
                //               minute: 'YYYY-MM-DD hh:mm:ss a'
                //           }
                //       }
                //   }]
              }
          }
        });
    }

    //datum should be in the form {x: ???, y: ???}
    pushDatum(datum){
        this.chart.data.datasets[0].data.push(datum);
        //this.chart.options.xAxes.ticks.suggestedMin = this.chart.data.datasets[0].data[0].x;
        this.chart.update();
    }

    clearData(){
        this.chart.data.datasets[0].data = [];
        //this.chart.options.xAxes.ticks.suggestedMin = new Date()
        this.chart.update();
    }

}