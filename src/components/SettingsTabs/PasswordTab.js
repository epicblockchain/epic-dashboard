import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import "./Inputs.css"

class PasswordTab extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            newPassword: '',
            verifyPassword: '',
            password: ''
        }

        this.updateNewPassword = this.updateNewPassword.bind(this);
        this.updateVerifyPassword = this.updateVerifyPassword.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    updateNewPassword(e){
        this.setState({newPassword: e.target.value});
    }

    updateVerifyPassword(e){
        this.setState({verifyPassword: e.target.value});
    }

    updatePassword(e){
        this.setState({password: e.target.value});
    }

    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                            placeholder="New password"
                            type="password"
                            onChange={this.updateNewPassword}/>
                <InputGroup className="inputClass"
                            placeholder="Verify New password"
                            type="password"
                            intent={this.state.newPassword !== this.state.verifyPassword ? "danger" : ""}
                            onChange={this.updateVerifyPassword}/>
                <div className="inputSpacer" />
                <InputGroup className="inputClass"
                            placeholder="Old password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.newPassword || !this.state.verifyPassword || !this.state.password 
                    || (this.state.verifyPassword !== this.state.newPassword) || !this.props.hasSomeMinersSelected()} onClick={this.props.applyClicked.bind(this, {
                        state: this.state,
                        tab: 'new-password'
                    })}>Apply</Button>
            </div>
        );
    }
}

export default PasswordTab;
