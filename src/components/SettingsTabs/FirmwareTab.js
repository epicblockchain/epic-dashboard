import React from 'react'

import { Button, InputGroup, Switch } from '@blueprintjs/core'
import "./Inputs.css"

const electron = window.require('electron')

class FirmwareTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isDefaultEnabled: true,
            keepSettings: true,
            swuFilepath: '',
            password: ''
        }
        this.getFilePath = this.getFilePath.bind(this)
        this.filepathIPChandler = this.filepathIPChandler.bind(this)

        this.updatePassword = this.updatePassword.bind(this);
        this.updateReuseHardwareConfig = this.updateReuseHardwareConfig.bind(this)
    }

    filepathIPChandler(event, msg){
        this.updateFirmwareFile(msg)
    }

    updateFirmwareFile(msg){
        this.setState({swuFilepath: msg})
    }

    componentDidMount(){
        electron.ipcRenderer.on('get-filepath-reply', this.filepathIPChandler)
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-filepath-reply', this.filepathIPChandler)
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
                <Button disabled={!this.state.password || !this.state.swuFilepath} onClick={this.props.applyClicked.bind(this, {
                    state: this.state,
                    tab: 'firmware'
                })}>Apply</Button>
            </div>
        );
    }
}

export default FirmwareTab;
