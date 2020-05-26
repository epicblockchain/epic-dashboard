class Worker{

    index;

    times = [];
    clock = [];
    inputPower = [];
    outputPower = [];
    inputCurrent = [];
    outputCurrent = [];
    inputVoltage = [];
    outputVoltage = [];
    temperature = [];
    //chart?

    constructor(index){
        this.index = index;
    }

    display(){
        if ( $('#worker-id-'+this.index).length ){
            $('#worker-id-'+this.index).replaceWith(this.workerHTML());
        } else {
            $('#worker-div').append(this.workerHTML());
        }
    }

    update(workerResponse){
        var d = new Date();
        this.times.push(d.getMilliseconds())
        this.clock.push(workerResponse["Core Clock"]);
        this.inputPower.push(workerResponse["Input Power"]);
        this.outputPower.push(workerResponse["Output Power"]);
        this.inputCurrent.push(workerResponse["Input Current"]);
        this.outputCurrent.push(workerResponse["Output Current"]);
        this.inputVoltage.push(workerResponse["Input Voltage"]);
        this.outputVoltage.push(workerResponse["Output Voltage"]);
        this.temperature.push(workerResponse["Temperature"]);
    }

    workerHTML(){
        return '<div id="worker-id-' + this.index + '" class="card col-12 mb-1"><div class="row"><div class="col">ID: ' + this.index
            + ' </div><div class="col">CLK: ' + this.clock[this.clock.length-1] 
            + ' </div><div class="col">TEMP: ' + this.temperature[this.temperature.length-1] 
            + ' </div><div class="col">P(IN/OUT): '+ this.inputPower[this.inputPower.length-1] +'/'+ this.outputPower[this.outputPower.length-1]
            + ' </div><div class="col">V(IN/OUT): '+ this.inputVoltage[this.inputVoltage.length-1] +'/'+ this.outputVoltage[this.outputVoltage.length-1] 
            + ' </div><div class="col">I(IN/OUT): '+ this.inputCurrent[this.inputCurrent.length-1] +'/'+ this.outputCurrent[this.outputCurrent.length-1]
            + '</div></div></div></div>';
    }

}