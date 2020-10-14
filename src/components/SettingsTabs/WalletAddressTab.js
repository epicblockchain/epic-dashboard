import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class WalletAddressTab extends React.Component {
    
    render() {
        return (
            <div>
                <div className="formRow">
                    <InputGroup className="inputClass walletAddress"
                                placeholder="Wallet address"
                                onChange={this.props.updateWalletAddress}/>
                    <p className="workerPeriod">{'.'}</p>
                    <InputGroup className="inputClass workerName"
                                placeholder="Worker name..."
                                onChange={this.props.updateWorkerName}/>
                </div>
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
