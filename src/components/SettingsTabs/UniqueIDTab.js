import React from 'react'

import { Button, InputGroup, Switch } from '@blueprintjs/core'
import "./Inputs.css"

class UniqueIDTab extends React.Component {
    
    render() {
        return (
            <div>
                <Switch defaultChecked={true}>Append Unique ID to Worker Name</Switch>
                <InputGroup className="inputClass" placeholder="Password" type="password" />
                <Button>Apply</Button>
            </div>
        );
    }
}

export default UniqueIDTab;
