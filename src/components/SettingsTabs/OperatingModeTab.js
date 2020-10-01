import React from 'react'

import { Button, FormGroup, InputGroup, Radio, RadioGroup } from '@blueprintjs/core'
import "./Inputs.css"

class OperatingModeTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <RadioGroup
                        label="Operating Mode"
                        onChange={this.props.onChangeOperatingMode}
                        selectedValue={this.props.operatingmode}
                        inline={true}
                    >
                        <Radio label="Normal" value="normal" />
                        <Radio label="Efficiency" value="efficiency" />
                    </RadioGroup>
                    <InputGroup className="inputClass" placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default OperatingModeTab;
