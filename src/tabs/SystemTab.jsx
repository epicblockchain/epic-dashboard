const {ipcRenderer} = require('electron');
import * as React from 'react';
import {Button, TextField, InputAdornment, FormControl, FormControlLabel, Switch, Divider, Grid, Typography} from '@material-ui/core';

export class SystemTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {filepath: '', keep: true, pass1: '', pass2: '', error: false, password: this.props.sessionPass};

        this.updateFilepath = this.updateFilepath.bind(this);
        this.updateKeep = this.updateKeep.bind(this);
        this.updatePass1 = this.updatePass1.bind(this);
        this.checkMatch = this.checkMatch.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateFilepath() {
        ipcRenderer
            .invoke('dialog-open', {
                filters: [{name: '.swu files', extensions: ['swu']}],
                properties: ['openFile'],
            })
            .then((args) => {
                if (!args.canceled) {
                    this.setState({filepath: args.filePaths[0]});
                }
            })
            .catch((err) => {
                console.log('filepath error', err);
            });
    }

    updateKeep(e) {
        this.setState({keep: e.target.checked});
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
        return (
            <div style={{padding: '12px 0'}}>
                <Grid container>
                    <Grid item xs>
                        <Typography>Update Firmware</Typography>
                        <TextField
                            variant="outlined"
                            label="Firmware file"
                            value={this.state.filepath}
                            disabled
                            margin="dense"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button onClick={this.updateFilepath} variant="contained" color="primary" size="small">
                                            Browse
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <br />
                        <FormControl margin="dense">
                            <FormControlLabel
                                control={<Switch color="primary" checked={this.state.keep} onChange={this.updateKeep} />}
                                label="Maintain config over update"
                            />
                        </FormControl>
                    </Grid>
                    <Divider orientation="vertical" flexItem style={{margin: '0 8px'}} />
                    <Grid item xs>
                        <Typography>Change password</Typography>
                        <TextField
                            variant="outlined"
                            label="New Password"
                            type="password"
                            onChange={this.updatePass1}
                            value={this.state.pass1}
                            margin="dense"
                        />
                        <TextField
                            variant="outlined"
                            label="Confirm New Password"
                            type="password"
                            onChange={this.checkMatch}
                            value={this.state.pass2}
                            error={this.state.error}
                            margin="dense"
                            helperText={this.state.error ? 'Passwords do not match' : ''}
                        />
                    </Grid>
                </Grid>
                <Grid container className={this.props.drawerOpen ? "password-apply password-applyShift" : "password-apply"}>
                    <Grid item xs>
                        <TextField
                            value={this.state.password || ''}
                            variant="outlined"
                            label="Password"
                            type="password"
                            onChange={this.updatePassword}
                            margin="dense"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    this.props.handleApi('/update', this.state, this.props.selected);
                                }
                            }}
                        />
                        <Button
                            onClick={() => {
                                this.props.handleApi('/update', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="primary"
                            disabled={!this.state.filepath || !this.state.password || !this.props.selected.length}
                        >
                            Apply
                        </Button>
                    </Grid>
                    <Grid item xs>
                        <Button
                            onClick={() => {
                                this.props.handleApi('/password', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="primary"
                            disabled={
                                !this.state.pass1 ||
                                !this.state.pass2 ||
                                !this.state.password ||
                                !this.props.selected.length
                            }
                        >
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
