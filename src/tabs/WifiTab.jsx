const {ipcRenderer} = require('electron');
import * as React from 'react';
import {Button, TextField, Grid, Typography} from '@material-ui/core';

export class WifiTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {ssid: '', psk: '', error: false, password: this.props.sessionPass};

        this.updateSsid = this.updateSsid.bind(this);
        this.updatePsk = this.updatePsk.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateSsid(e) {
        this.setState({ssid: e.target.value});
    }

    updatePsk(e) {
        this.setState({psk: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return (
            <div className="tab-body" style={{minHeight: '200px'}}>
                <Grid container>
                    <Grid item xs>
                        <Typography>Enter Wifi Name</Typography>
                        <TextField
                            variant="outlined"
                            label="Wifi Name"
                            type="ssid"
                            onChange={this.updateSsid}
                            value={this.state.ssid}
                            margin="dense"
                        />
                        <Typography>Enter Wifi Password</Typography>
                        <TextField
                            variant="outlined"
                            label="Password"
                            type="psk"
                            onChange={this.updatePsk}
                            value={this.state.psk}
                            margin="dense"
                            inputProps={{minLength: 8}}
                        />
                    </Grid>
                </Grid>
                <div className="password-apply">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !disabled) {
                                this.props.handleApi('/wifi', this.state, this.props.selected);
                            }
                        }}
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/wifi', this.state, this.props.selected);
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
