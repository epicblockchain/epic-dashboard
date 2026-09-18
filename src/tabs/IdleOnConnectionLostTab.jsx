import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch} from '@mui/material';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';

export class IdleOnConnectionLostTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {is_idle_on_connection_lost: true, password: this.props.sessionPass};

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
        this.setState({is_idle_on_connection_lost: !this.state.is_idle_on_connection_lost});
    };

    render() {
        const disabled = !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body settings-tab">
                <TabHeader
                    title="Idle On Connection Lost"
                    description="On connection loss, the miner goes idle. When disabled, it continues drawing power."
                />
                <Grid
                    container
                    spacing={2}
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <Grid>
                        <Switch
                            checked={this.state.is_idle_on_connection_lost}
                            onChange={this.handleIdleOnConnectionLost}
                        />
                    </Grid>
                    <Grid>
                        <Typography variant="body2" color="textSecondary">
                            {this.state.is_idle_on_connection_lost ? 'Enabled' : 'Disabled'}
                        </Typography>
                    </Grid>
                </Grid>
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
                    <Button
                        onClick={() => {
                            this.props.handleApi('/idleonconnectionlost', this.state, this.props.selected);
                        }}
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                    >
                        {getMinerActionLabel('Apply', this.props.selected)}
                    </Button>
                </TabFooter>
            </div>
        );
    }
}
