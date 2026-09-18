const {ipcRenderer} = require('electron');
import * as React from 'react';
import {
    Button,
    TextField,
    InputAdornment,
    FormControl,
    FormControlLabel,
    Checkbox,
    Divider,
    Grid,
    Typography,
} from '@mui/material';

import './SystemTab.css';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';

export class SystemTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filepath: '',
            fileext: '',
            keep: true,
            pass1: '',
            pass2: '',
            error: false,
            timezone: '',
            password: this.props.sessionPass,
        };

        this.updateFilepath = this.updateFilepath.bind(this);
        this.updateKeep = this.updateKeep.bind(this);
        this.updatePass1 = this.updatePass1.bind(this);
        this.checkMatch = this.checkMatch.bind(this);
        this.updateTimezone = this.updateTimezone.bind(this);
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
                filters: [{name: '.zip/.swu', extensions: ['zip', 'swu']}],
                properties: ['openFile'],
            })
            .then((args) => {
                if (!args.canceled) {
                    const filepath = args.filePaths[0];
                    this.setState({filepath, fileext: filepath.split('.').pop()});
                }
            })
            .catch((err) => {
                console.log('filepath error', err);
            });
    }

    updateKeep(e) {
        this.setState({keep: e.target.checked});
    }

    updateTimezone(e) {
        this.setState({timezone: e.target.value});
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
            <div className="tab-body settings-tab">
                <TabHeader
                    title="System"
                    description="Update firmware, timezone, or authentication settings for selected miners."
                />
                <Grid container>
                    <Grid className="system-option" size={{xs: 12, md: 4}}>
                        <Typography>Update Firmware</Typography>
                        <Grid>
                            <TextField
                                variant="outlined"
                                label="System Update File (.zip/.swu)"
                                value={this.state.filepath}
                                disabled
                                margin="dense"
                                style={{width: '100%'}}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button onClick={this.updateFilepath} variant="outlined" size="small">
                                                    Browse
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <br />
                            <FormControl margin="dense">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={this.state.keep}
                                            onChange={this.updateKeep}
                                        />
                                    }
                                    label="Maintain config over update"
                                />
                            </FormControl>
                        </Grid>
                        <Grid>
                            <Button
                                onClick={() => {
                                    if (this.state.fileext == 'swu') {
                                        this.props.handleFormApi('/update', this.state, this.props.selected);
                                    } else if (this.state.fileext == 'zip') {
                                        this.props.handleFormApi('/systemupdate', this.state, this.props.selected);
                                    }
                                }}
                                variant="contained"
                                color="primary"
                                disabled={
                                    (!this.state.filepath && !this.state.filepath2) ||
                                    !this.state.password ||
                                    !this.props.selected.length
                                }
                            >
                                {getMinerActionLabel('Apply', this.props.selected)}
                            </Button>
                        </Grid>
                    </Grid>
                    <Divider className="system-divider" orientation="vertical" flexItem />
                    <Grid className="system-option" size={{xs: 12, md: 4}}>
                        <Typography>Change System Timezone</Typography>
                        <TextField
                            variant="outlined"
                            label="Timezone (e.g. America/Toronto)"
                            onChange={this.updateTimezone}
                            value={this.state.timezone}
                            style={{width: '100%'}}
                            margin="dense"
                        />
                        <Button
                            onClick={() => {
                                this.props.handleApi('/timezone', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="primary"
                            disabled={!this.state.timezone || !this.state.password || !this.props.selected.length}
                        >
                            {getMinerActionLabel('Apply', this.props.selected)}
                        </Button>
                    </Grid>
                    <Divider className="system-divider" orientation="vertical" flexItem />
                    <Grid className="system-option" size={{xs: 12, md: 4}}>
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
                        <Button
                            onClick={() => {
                                this.props.handleApi('/password', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="primary"
                            disabled={
                                this.state.error ||
                                !this.state.pass1 ||
                                !this.state.pass2 ||
                                !this.state.password ||
                                !this.props.selected.length
                            }
                        >
                            {getMinerActionLabel('Apply', this.props.selected)}
                        </Button>
                    </Grid>
                    <Grid size={12}>
                        <TabFooter>
                            <TextField
                                value={this.state.password || ''}
                                variant="outlined"
                                label="Password"
                                type="password"
                                onChange={this.updatePassword}
                                margin="dense"
                                error={!this.state.password}
                            />
                        </TabFooter>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
