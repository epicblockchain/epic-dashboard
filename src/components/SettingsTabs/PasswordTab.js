import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import "./Inputs.css"

class PasswordTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup className="inputClass" placeholder="New password" type="password"/>
                    <InputGroup className="inputClass" placeholder="Verify New password" type="password"/>
                    <div className="inputSpacer" />
                    <InputGroup className="inputClass" placeholder="Old password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default PasswordTab;
