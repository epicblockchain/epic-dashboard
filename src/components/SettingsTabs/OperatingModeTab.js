import React from 'react'

import { Button, InputGroup, Radio, RadioGroup } from '@blueprintjs/core'
import "./Inputs.css"

class OperatingModeTab extends React.Component {
    
    render() {
        return (
            <div>
                <RadioGroup
                    label="Operating Mode"
                    inline={true}
                    onChange={this.props.updateOperatingMode}
                >
                    <Radio label="Normal" value="normal" />
                    <Radio label="Efficiency" value="efficiency" />
                </RadioGroup>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'operating-mode')}>Apply</Button>
            </div>
        );
    }
}

export default OperatingModeTab;
