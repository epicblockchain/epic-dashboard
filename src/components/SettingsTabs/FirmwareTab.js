import React from 'react'

import { Button, FileInput, InputGroup, Switch } from '@blueprintjs/core'
import "./Inputs.css"

class FirmwareTab extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isEnabled: true
        }
    }


    render() {
        return (
            <div>
                <FileInput text="Browse"
                            fill={true}
                            inputProps={{accept: ".swu"}}
                            onInputChange={this.props.updateFirmwareFile}/>
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
