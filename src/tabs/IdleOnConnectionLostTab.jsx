import * as React from 'react';
import {Button, TextField} from '@mui/material';
import {getMinerActionLabel, SettingToggle, TabFooter, TabHeader} from './TabLayout.jsx';

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
                <SettingToggle
                    checked={this.state.is_idle_on_connection_lost}
                    onChange={this.handleIdleOnConnectionLost}
                    label={this.state.is_idle_on_connection_lost ? 'Enabled' : 'Disabled'}
                    description="Idle on connection loss instead of continuing to draw mining power."
                />
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
