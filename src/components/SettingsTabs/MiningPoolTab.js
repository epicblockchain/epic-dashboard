import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class MiningPoolTab extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            miningPool: '',
            password: ''
        }

        this.updateMiningPool = this.updateMiningPool.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
    }

    updateMiningPool(e){
        this.setState({miningPool: e.target.value});
    }

    updatePassword(e){
        this.setState({password: e.target.value});
    }

    render() {
        return (
            <div>
                <div className="formRow">
                    <p className="stratumText">stratum+tcp://</p>
                    <InputGroup className="inputClass miningPool"
                            placeholder="Mining Pool"
                            onChange={this.updateMiningPool} />
                </div>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button className="epicButton" disabled={ !this.state.miningPool || !this.state.password || !this.props.hasSomeMinersSelected() } onClick={this.props.applyClicked.bind(this, {
                    state: this.state,
                    tab: 'mining-pool'
                })}>Apply</Button>
            </div>
        );
    }
}

export default MiningPoolTab;
