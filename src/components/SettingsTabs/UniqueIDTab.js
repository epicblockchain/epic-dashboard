import React from 'react'

import { Button, Checkbox, FormGroup, InputGroup } from '@blueprintjs/core'

class UniqueIDTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <Checkbox>Append Unique ID to Worker Name</Checkbox>
                    <InputGroup placeholder="Password" type="password" />
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default UniqueIDTab;
