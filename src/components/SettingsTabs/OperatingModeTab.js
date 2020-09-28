import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'

class OperatingModeTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup placeholder="Operating mode"/>
                    <InputGroup placeholder="Password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default OperatingModeTab;
