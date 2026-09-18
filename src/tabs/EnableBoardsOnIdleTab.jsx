import * as React from 'react';
import {Button, TextField} from '@mui/material';
import {getMinerActionLabel, SettingToggle, TabFooter, TabHeader} from './TabLayout.jsx';

export class EnableBoardsOnIdleTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {enable_boards_on_idle: true, password: this.props.sessionPass};

        this.handleEnableBoardsOnIdle = this.handleEnableBoardsOnIdle.bind(this);
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

    handleEnableBoardsOnIdle = () => {
        this.setState({enable_boards_on_idle: !this.state.enable_boards_on_idle});
    };

    render() {
        const disabled = !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body settings-tab">
                <TabHeader
                    title="Enable Boards On Idle"
                    description="Re-enable disabled boards automatically after the miner remains idle for 10 minutes."
                />
                <SettingToggle
                    checked={this.state.enable_boards_on_idle}
                    onChange={this.handleEnableBoardsOnIdle}
                    label={this.state.enable_boards_on_idle ? 'Enabled' : 'Disabled'}
                    description="Re-enable disabled boards after ten minutes of idle time."
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
                            this.props.handleApi('/enableboardsonidle', this.state, this.props.selected);
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
