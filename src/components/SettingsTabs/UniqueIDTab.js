import React from 'react'

import { Button, InputGroup, Switch } from '@blueprintjs/core'
import "./Inputs.css"

class UniqueIDTab extends React.Component {
    
    render() {
        return (
            <div>
                <Switch defaultChecked={true}
                        onChange={this.props.updateAppendUniqueID}    
                    >Append Unique ID to Worker Name</Switch>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.props.updatePassword}/>
                <Button onClick={this.props.applyClicked.bind(this, 'unique-id')}>Apply</Button>
            </div>
        );
    }
}

export default UniqueIDTab;
