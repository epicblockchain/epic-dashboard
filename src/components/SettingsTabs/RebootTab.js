import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class RebootTab extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            rebootDelay: '',
            password: ''
        }

        this.updateReboot = this.updateReboot.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
    }

    updateReboot(e){
        this.setState({rebootDelay: e.target.value})
    }

    updatePassword(e){
        this.setState({password: e.target.value})
    }

    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                        placeholder="Delay before reboot (seconds)"
                        intent={isNaN(this.state.rebootDelay) ? "danger" : ""}
                        onChange={this.updateReboot} />
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.rebootDelay || !this.state.password || isNaN(this.state.rebootDelay) || !this.props.hasSomeMinersSelected()} onClick={this.props.applyClicked.bind(this, {
                    state: this.state,
                    tab: 'reboot'
                })}>Reboot</Button>
            </div>
        );
    }
}

export default RebootTab;
