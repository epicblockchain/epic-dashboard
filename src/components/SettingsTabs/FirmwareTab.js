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
                <FileInput text="Browse" fill={true} inputProps={{accept: ".swu"}} />
                <Switch defaultChecked={this.state.isEnabled}>Maintain config over update</Switch>
                <InputGroup className="inputClass" placeholder="Password" type="password"/>
                <Button>Apply</Button>
            </div>
        );
    }
}

export default FirmwareTab;
