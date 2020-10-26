import React from 'react'

import { Button, InputGroup, Switch } from '@blueprintjs/core'
import "./Inputs.css"

class UniqueIDTab extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            appendUniqueID: true,
            password: ''
        }

        this.updateAppendUniqueID = this.updateAppendUniqueID.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
    }

    updateAppendUniqueID(e){
        this.setState({appendUniqueID: e.target.checked})
    }

    updatePassword(e){
        this.setState({password: e.target.value})
    }

    render() {
        return (
            <div>
                <Switch defaultChecked={true}
                        onChange={this.updateAppendUniqueID}    
                    >Append Unique ID to Worker Name</Switch>
                <InputGroup className="inputClass"
                            placeholder="Password"
                            type="password"
                            onChange={this.updatePassword}/>
                <Button disabled={!this.state.password || !this.props.hasSomeMinersSelected() } onClick={this.props.applyClicked.bind(this, {
                    state: this.state,
                    tab: 'unique-id'
                })}>Apply</Button>
            </div>
        );
    }
}

export default UniqueIDTab;
