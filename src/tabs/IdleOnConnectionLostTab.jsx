import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch} from '@mui/material';

export class IdleOnConnectionLostTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {load: true, password: this.props.sessionPass};

        this.handleIdleOnConnectionLost = this.handleIdleOnConnectionLost.bind(this);
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

    handleIdleOnConnectionLost = () => {
        this.setState({load: !this.state.load});
    };

    render() {
        const disabled = !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body">
                <Typography variant="h6" gutterBottom>
                    Idle On Connection Lost
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    On connection lost, the miner will go to idle. When disabled, the miner will continue to draw power.
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Switch checked={this.state.load} onChange={this.handleIdleOnConnectionLost} />
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" color="textSecondary">
                            {this.state.load ? 'Enabled' : 'Disabled'}
                        </Typography>
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
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/idleonconnectionlost', this.state, this.props.selected);
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
