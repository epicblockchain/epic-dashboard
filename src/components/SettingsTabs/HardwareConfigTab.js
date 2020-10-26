import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class HardwareConfigTab extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            password: ''
        }

        this.updatePassword = this.updatePassword.bind(this)
    }

    updatePassword(e){
        this.setState({password: e.target.value})
    }

    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.password || !this.props.hasSomeMinersSelected()} onClick={this.props.applyClicked.bind(this, {
                    state: this.state,
                    tab: 'hwconfig'
                })}>Recalibrate Hardware</Button>
            </div>
        );
    }
}

export default HardwareConfigTab;
