import React from 'react'

import { Button, Checkbox, FileInput, FormGroup, InputGroup } from '@blueprintjs/core'
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
                <FormGroup>
                    <FileInput text="Browse" fill={true} inputProps={{accept: ".swu"}} />
                    <Checkbox defaultChecked={this.state.isEnabled}>Maintain config over update</Checkbox>
                    <InputGroup className="inputClass" placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default FirmwareTab;
