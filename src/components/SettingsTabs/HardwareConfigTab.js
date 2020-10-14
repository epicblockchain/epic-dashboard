import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class HardwareConfigTab extends React.Component {

    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'hwconfig')}>Reinitialize Hardware Configuration</Button>
            </div>
        );
    }
}

export default HardwareConfigTab;
