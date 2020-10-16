import React from 'react'

import { Button, InputGroup, Switch } from '@blueprintjs/core'
import "./Inputs.css"

const electron = window.require('electron')

class FirmwareTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isEnabled: true,
        }
        this.getFilePath = this.getFilePath.bind(this)
        this.filepathIPChandler = this.filepathIPChandler.bind(this)
    }

    filepathIPChandler(event, msg){
        this.props.updateFirmwareFile(msg)
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

    render() {
        return (
            <div>
                <label className="bp3-file-input bp3-fill" >
                  <input />
                  <span className="bp3-file-upload-input" onClick={this.getFilePath}>{this.props.swuFilepath || 'Choose file...'}</span>
                </label>
                <Switch defaultChecked={this.state.isEnabled}
                        onChange={this.props.updateReuseHardwareConfig}
                        >Maintain config over update</Switch>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'firmware')}>Apply</Button>
            </div>
        );
    }
}

export default FirmwareTab;
