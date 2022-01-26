import * as React from 'react';
import {Button, TextField, Paper, Divider} from '@material-ui/core';
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

export class ControlTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {cmd: 'autostart', delay: '0', password: this.props.sessionPass};

        this.updateCmd = this.updateCmd.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateCmd(e, newCmd) {
        this.setState({cmd: newCmd});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let api = this.state.cmd === 'stop' ? '/miner' : this.state.cmd;

        return (
            <div style={{padding: '12px 0'}} id="control-tab">
                <Paper variant="outlined" elevation={0} style={{ padding: "4px", display: "inline-block"}}>
                    <ToggleButtonGroup value={this.state.cmd} exclusive onChange={this.updateCmd}>
                        <ToggleButton value="/softreboot" className="but-group">
                            Restart Mining
                        </ToggleButton>
                        <ToggleButton value="stop" className="but-group">
                            Stop Mining
                        </ToggleButton>
                        <Divider orientation="vertical" flexItem style={{margin: '4px'}} />
                        <ToggleButton value="/reboot" className="but-group">
                            Reboot
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Paper>
                <div className="password-apply">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                this.props.handleApi(api, this.state, this.props.selected);
                            }
                        }}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi(api, this.state, this.props.selected);
                        }}
                        variant="contained"
                        color="primary"
                        disabled={!this.state.password || !this.props.selected.length}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
