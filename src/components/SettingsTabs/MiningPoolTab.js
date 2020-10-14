import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class MiningPoolTab extends React.Component {

    render() {
        return (
            <div>
                <div className="formRow">
                    <p className="stratumText">stratum+tcp://</p>
                    <InputGroup className="inputClass miningPool"
                            placeholder="Mining Pool"
                            onChange={this.props.updateMiningPool} />
                </div>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'mining-pool')}>Apply</Button>
            </div>
        );
    }
}

export default MiningPoolTab;
