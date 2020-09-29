import React from 'react'

import { Button, Checkbox, FormGroup, InputGroup } from '@blueprintjs/core'
import "./Inputs.css"

class UniqueIDTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <Checkbox defaultChecked={true}>Append Unique ID to Worker Name</Checkbox>
                    <InputGroup className="inputClass" placeholder="Password" type="password" />
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default UniqueIDTab;
