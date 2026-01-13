import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch} from '@mui/material';

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
            <div className="tab-body">
                <Typography variant="h6" gutterBottom>
                    Enable Boards On Idle
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Automatically re-enable any disabled boards if the miner remains idle for more than 10 minutes.
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Switch checked={this.state.enable_boards_on_idle} onChange={this.handleEnableBoardsOnIdle} />
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" color="textSecondary">
                            {this.state.enable_boards_on_idle ? 'Enabled' : 'Disabled'}
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
                            this.props.handleApi('/enableboardsonidle', this.state, this.props.selected);
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
