import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'

class MiningPoolTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup placeholder="Mining pool"/>
                    <InputGroup placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default MiningPoolTab;
