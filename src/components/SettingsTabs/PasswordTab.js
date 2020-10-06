import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import "./Inputs.css"

class PasswordTab extends React.Component {
    
    render() {
        return (
            <div>
                <InputGroup className="inputClass" placeholder="New password" type="password"/>
                <InputGroup className="inputClass" placeholder="Verify New password" type="password"/>
                <div className="inputSpacer" />
                <InputGroup className="inputClass" placeholder="Old password" type="password"/>
                <Button>Apply</Button>
            </div>
        );
    }
}

export default PasswordTab;
