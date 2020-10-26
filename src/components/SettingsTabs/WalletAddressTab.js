import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class WalletAddressTab extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            walletAddress: '',
            workerName: '',
            password: ''
        }

        this.updateWalletAddress = this.updateWalletAddress.bind(this);
        this.updateWorkerName = this.updateWorkerName.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    updateWalletAddress(e){
        this.setState({walletAddress: e.target.value});
    }

    updateWorkerName(e){
        this.setState({workerName: e.target.value});
    }

    updatePassword(e){
        this.setState({password: e.target.value})
    }


    render() {
        return (
            <div>
                <div className="formRow">
                    <InputGroup className="inputClass walletAddress"
                                placeholder="Wallet address"
                                onChange={this.updateWalletAddress}/>
                    <p className="workerPeriod">{'.'}</p>
                    <InputGroup className="inputClass workerName"
                                placeholder="Worker name..."
                                onChange={this.updateWorkerName}/>
                </div>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.walletAddress || !this.state.workerName || !this.state.password || !this.props.hasSomeMinersSelected()}
                    onClick={this.props.applyClicked.bind(this, {
                        state: this.state,
                        tab: 'wallet-address'
                    })}>Apply</Button>
            </div>
        );
    }
}

export default WalletAddressTab;
