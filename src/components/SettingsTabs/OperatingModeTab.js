import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import "./Inputs.css"

class OperatingModeTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup className="inputClass" placeholder="Operating mode"/>
                    <InputGroup className="inputClass" placeholder="Password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default OperatingModeTab;
