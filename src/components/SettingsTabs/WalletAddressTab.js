import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class WalletAddressTab extends React.Component {
    
    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                            placeholder="Wallet address"
                            onChange={this.props.updateWalletAddress}/>
                <InputGroup className="inputClass"
                            placeholder="Worker name..."
                            onChange={this.props.updateWorkerName}/>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'wallet-address')}>Apply</Button>
            </div>
        );
    }
}

export default WalletAddressTab;
