import React from 'react'

import { Button, InputGroup, Spinner, Switch } from '@blueprintjs/core'
import { EpicToaster } from '../Toasters'

import "./Inputs.css"

const electron = window.require('electron')

class FirmwareTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isDefaultEnabled: true,
            keepSettings: true,
            swuFilepath: '',
            password: '',
            waitingForCompletion: false
        }
        this.getFilePath = this.getFilePath.bind(this)
        this.filepathIPChandler = this.filepathIPChandler.bind(this)

        this.updatePassword = this.updatePassword.bind(this);
        this.updateReuseHardwareConfig = this.updateReuseHardwareConfig.bind(this)
        this.handleApplyClick = this.handleApplyClick.bind(this)

        this.handleFirmwareJobsDone = this.handleFirmwareJobsDone.bind(this)
    }

    handleFirmwareJobsDone(){
        this.setState({waitingForCompletion: false});
    }

    handleApplyClick(e){
        this.setState({waitingForCompletion: true});
        this.props.applyClicked({
            state: this.state,
            tab: 'firmware'
        }, e);
        EpicToaster.show({
            message: "This may take a few minutes depending on the number of miners being updated.",
            intent: 'warning'
        });
    }

    filepathIPChandler(event, msg){
        this.updateFirmwareFile(msg)
    }

    updateFirmwareFile(msg){
        this.setState({swuFilepath: msg})
    }

    componentDidMount(){
        electron.ipcRenderer.on('get-filepath-reply', this.filepathIPChandler);
        electron.ipcRenderer.on('done-firmware-job', this.handleFirmwareJobsDone);
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-filepath-reply', this.filepathIPChandler)
        electron.ipcRenderer.removeListener('done-firmware-job', this.handleFirmwareJobsDone);
    }

    getFilePath(){
        electron.ipcRenderer.send('get-filepath');
    }

    updateReuseHardwareConfig(e){
        this.setState({keepSetting: e.target.checked})
    }

    updatePassword(e){
        this.setState({password: e.target.value})
    }

    render() {
        return (
            <div>
                <label className="bp3-file-input bp3-fill" >
                  <input />
                  <span className="bp3-file-upload-input" onClick={this.getFilePath}>{this.state.swuFilepath || 'Choose file...'}</span>
                </label>
                <Switch defaultChecked={this.state.isDefaultEnabled}
                        onChange={this.updateReuseHardwareConfig}
                        >Maintain config over update</Switch>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.password || !this.state.swuFilepath || this.state.waitingForCompletion || !this.props.hasSomeMinersSelected()} onClick={this.handleApplyClick}>
                    { this.state.waitingForCompletion ? <Spinner className="applyButtonSpinner" size={20} /> : "Apply" }
                </Button>
            </div>
        );
    }
}

export default FirmwareTab;
