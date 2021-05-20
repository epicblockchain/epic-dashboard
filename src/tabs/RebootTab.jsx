import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class RebootTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {delay: '', password: ''};

        this.updateDelay = this.updateDelay.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }
    
    updateDelay(e) {
        this.setState({delay: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="Reboot Delay" type="number" onChange={this.updateDelay}
                    value={this.state.delay} helperText="(seconds)"
                />
                <TextField variant="outlined" label="Password" type="password" onChange={this.updatePassword}/>
                <Button onClick={() => {
                        this.props.handleApi('/reboot', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.delay || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}