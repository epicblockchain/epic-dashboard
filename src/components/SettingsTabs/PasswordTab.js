import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import "./Inputs.css"

class PasswordTab extends React.Component {
    
    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                            placeholder="New password"
                            type="password"
                            onChange={this.props.updateNewPassword}/>
                <InputGroup className="inputClass"
                            placeholder="Verify New password"
                            type="password"
                            onChange={this.props.updateVerifyPassword}/>
                <div className="inputSpacer" />
                <InputGroup className="inputClass"
                            placeholder="Old password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'new-password')}>Apply</Button>
            </div>
        );
    }
}

export default PasswordTab;
