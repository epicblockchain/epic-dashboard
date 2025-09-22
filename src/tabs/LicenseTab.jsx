import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch} from '@mui/material';

export class LicenseTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {license_key: '', password: this.props.sessionPass};

        this.updateLicenseKey = this.updateLicenseKey.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    updateLicenseKey(e) {
        this.setState({license_key: e.target.value});
    }

    render() {
        const disabled = !this.state.license_key || !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body">
                <Typography variant="h6" gutterBottom>
                    License
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Enter your license key below.
                </Typography>
                <TextField
                    variant="outlined"
                    label="Key"
                    onChange={this.updateLicenseKey}
                    value={this.state.license_key}
                    margin="dense"
                />
                <div className="password-apply">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/loadlicense', this.state, this.props.selected);
                        }}
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
