import React from 'react'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'

class PasswordTab extends React.Component {
    
    render() {
        return (
            <div>
                <FormGroup>
                    <InputGroup placeholder="New password" type="password"/>
                    <InputGroup placeholder="Old password" type="password"/>
                    <Button>Apply</Button>
                </FormGroup>
            </div>
        );
    }
}

export default PasswordTab;
