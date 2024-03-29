import * as React from 'react';
import {Button, TextField, Paper, Grid} from '@mui/material';

export class ControlTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {cmd: 'stop', delay: '0', password: this.props.sessionPass};

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

    render() {
        const disabled = !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body" id="control-tab">
                <Paper variant="outlined" elevation={0} style={{padding: '2px', display: 'inline-block'}}>
                    <Grid container>
                        <Button
                            onClick={() => {
                                this.props.handleApi('/miner', this.state, this.props.selected);
                            }}
                            variant="contained"
                            className="but-group stop"
                            color="error"
                            disabled={disabled}
                        >
                            Stop Mining
                        </Button>
                        <Button
                            onClick={() => {
                                this.props.handleApi('/softreboot', this.state, this.props.selected);
                            }}
                            variant="contained"
                            className="but-group"
                            color="success"
                            disabled={disabled}
                        >
                            Restart Mining
                        </Button>
                        <Button
                            onClick={() => {
                                this.props.handleApi('/reboot', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="primary"
                            className="but-group"
                            disabled={disabled}
                        >
                            Reboot
                        </Button>
                        <Button
                            onClick={() => {
                                this.props.handleApi('/defaultconfig', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="error"
                            className="but-group"
                            disabled={disabled}
                        >
                            Reset Default Config
                        </Button>
                    </Grid>
                </Paper>
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
                </div>
            </div>
        );
    }
}
