import React from 'react'

import { Button, InputGroup, Radio, RadioGroup } from '@blueprintjs/core'
import "./Inputs.css"

class OperatingModeTab extends React.Component {
    
    render() {
        return (
            <p>temp</p>
        )
        return (
            <div>
                <RadioGroup
                    label="Operating Mode"
                    inline={true}
                >
                    <Radio label="Normal" value="normal" />
                    <Radio label="Efficiency" value="efficiency" />
                </RadioGroup>
                <InputGroup className="inputClass" placeholder="Password" type="password"/>
                <Button>Apply</Button>
            </div>
        );
    }
}

export default OperatingModeTab;
