import React from 'react'

import { Button, InputGroup, NumericInput } from '@blueprintjs/core'
import './Inputs.css'

class RebootTab extends React.Component {

    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                        placeholder="Delay before reboot (seconds)"
                        onChange={this.props.updateReboot} />
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'reboot')}>Reboot</Button>
            </div>
        );
    }
}

export default RebootTab;
