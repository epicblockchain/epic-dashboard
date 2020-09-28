import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'

class WalletAddressTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup placeholder="Wallet address"/>
                    <InputGroup placeholder="Worker name..."/>
                    <InputGroup placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default WalletAddressTab;
