import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class MiningPoolTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup className="inputClass" placeholder="Mining pool"/>
                    <InputGroup className="inputClass" placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default MiningPoolTab;
