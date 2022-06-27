import * as React from 'react';
import {Button, TextField, Grid, Typography, InputAdornment, IconButton} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

export class WifiTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {ssid: '', psk: '', visible: false, error: false, password: this.props.sessionPass};

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

    clickShowPassword() {
        this.setState({visible: !this.state.visible});
    }

    mouseDownPassword(e) {
        e.preventDefault();
    }

    render() {
        const disabled = this.state.ssid.length < 1 || this.state.psk.length < 8;
        return (
            <div className="tab-body" style={{minHeight: '200px'}}>
                <Grid container>
                    <Grid item xs>
                        <Typography>Change Wifi Config</Typography>
                        <TextField
                            variant="outlined"
                            label="Wifi Name"
                            type="ssid"
                            onChange={this.updateSsid}
                            value={this.state.ssid}
                            margin="dense"
                        />
                        <TextField
                            variant="outlined"
                            label="Wifi Password"
                            type={this.state.visible ? '' : 'password'}
                            onChange={this.updatePsk}
                            value={this.state.psk}
                            margin="dense"
                            inputProps={{minLength: 8}}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => this.clickShowPassword()}
                                            onMouseDown={(e) => this.mouseDownPassword(e)}
                                        >
                                            {this.state.visible ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
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
                        disabled={disabled}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
