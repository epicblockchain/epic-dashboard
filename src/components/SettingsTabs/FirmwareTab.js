import React from 'react'

import { Button, FileInput, FormGroup, InputGroup } from '@blueprintjs/core'

class FirmwareTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <FileInput text="Browse" fill={true} />
                    <InputGroup placeholder="Password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default FirmwareTab;
