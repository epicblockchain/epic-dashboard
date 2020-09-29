import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class WalletAddressTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup className="inputClass" placeholder="Wallet address"/>
                    <InputGroup className="inputClass" placeholder="Worker name..."/>
                    <InputGroup className="inputClass" placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default WalletAddressTab;
