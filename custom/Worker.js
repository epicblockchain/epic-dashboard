class Worker{

    index;
    clock = [];
    inputPower = [];
    outputPower = [];
    inputCurrent = [];
    outputCurrent = [];
    inputVoltage = [];
    outputVoltage = [];
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
        this.clock.push(workerResponse["Core Clock"]);
        this.inputPower.push(workerResponse["Input Power"]);
        this.outputPower.push(workerResponse["Output Power"]);
        this.inputCurrent.push(workerResponse["Input Current"]);
        this.outputCurrent.push(workerResponse["Output Current"]);
        this.inputVoltage.push(workerResponse["Input Voltage"]);
        this.outputVoltage.push(workerResponse["Output Voltage"]);
    }

    workerHTML(){
        return '<div id="worker-id-' + this.index + '" class="card col-12 mr-1 mt-1">worker: ' + JSON.stringify(this) + '</div>';
    }

}