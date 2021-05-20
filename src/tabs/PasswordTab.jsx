import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class PasswordTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {pass1: '', pass2: '', error: false, password: ''};

        this.updatePass1 = this.updatePass1.bind(this);
        this.checkMatch = this.checkMatch.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }
    
    updatePass1(e) {
        this.setState({pass1: e.target.value});
    }

    checkMatch(e) {
        if (this.state.pass1 == e.target.value) {
            this.setState({error: false, pass2: e.target.value});
        } else {
            this.setState({error: true, pass2: e.target.value});
        }
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="New Password" type="password" onChange={this.updatePass1}
                    value={this.state.pass1}
                />
                <TextField variant="outlined" label="Confirm New Password" type="password" onChange={this.checkMatch}
                    value={this.state.pass2} error={this.state.error}
                    helperText={this.state.error ? 'Passwords do not match' : ''}
                />
                <TextField variant="outlined" label="Password" type="password" onChange={this.updatePassword}/>
                <Button onClick={() => {
                        this.props.handleApi('/password', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.pass1 || !this.state.pass2 || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}