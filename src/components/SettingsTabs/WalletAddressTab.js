import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class WalletAddressTab extends React.Component {
    
    render() {
        return (
            <div>
                <InputGroup className="inputClass" placeholder="Wallet address"/>
                <InputGroup className="inputClass" placeholder="Worker name..."/>
                <InputGroup className="inputClass" placeholder="Password" type="password"/>
                <Button>Apply</Button>
            </div>
        );
    }
}

export default WalletAddressTab;
