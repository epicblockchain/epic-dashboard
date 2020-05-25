

class ChartManager {

    chart;

    constructor(title, id){
        var el = document.getElementById(id);
        this.chart = new Chart(el, {
          type: 'line', //can also be scatter to show x-axis or just change options
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
              }
          }
        });
    }

    //datum should be in the form {x: ???, y: ???}
    pushDatum(datum){
        this.chart.data.datasets[0].data.push(datum);
        this.chart.update();
    }

    clearData(){
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    }

}