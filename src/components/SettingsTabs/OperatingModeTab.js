import React from 'react'

import { Button, InputGroup, Radio, RadioGroup } from '@blueprintjs/core'
import "./Inputs.css"

class OperatingModeTab extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            operatingMode: 'normal',
            password: ''
        }

        this.updateOperatingMode = this.updateOperatingMode.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
    }

    updateOperatingMode(e){
        this.setState({operatingMode: e.target.value});
    }

    updatePassword(e){
        this.setState({password: e.target.value})
    }

    render() {
        return (
            <div>
                <RadioGroup
                    label="Operating Mode"
                    inline={true}
                    onChange={this.updateOperatingMode}
                    selectedValue={this.state.operatingMode}
                >
                    <Radio label="Normal" value="normal" />
                    <Radio label="Efficiency" value="efficiency" />
                </RadioGroup>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.password || !this.props.hasSomeMinersSelected()} onClick={this.props.applyClicked.bind(this, {
                    state: this.state,
                    tab: 'operating-mode'
                })}>Apply</Button>
            </div>
        );
    }

}

export default OperatingModeTab;
