import React from 'react'

import { Button, Checkbox, FileInput, FormGroup, InputGroup } from '@blueprintjs/core'

class FirmwareTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <FileInput text="Browse" fill={true} />
                    <Checkbox>Maintain config over update</Checkbox> //todo default checked
                    <InputGroup placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default FirmwareTab;
