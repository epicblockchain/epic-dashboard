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
        console.log(JSON.stringify(this));
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

}