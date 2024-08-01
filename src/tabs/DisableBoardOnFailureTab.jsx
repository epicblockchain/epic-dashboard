import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch} from '@mui/material';

export class DisableBoardOnFailureTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {disable_board_on_failure: true, password: this.props.sessionPass};

        this.handleDisableBoardOnFail = this.handleDisableBoardOnFail.bind(this);
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

    handleDisableBoardOnFail = () => {
        this.setState({disable_board_on_failure: !this.state.disable_board_on_failure});
    };

    render() {
        const disabled = !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body">
                <Typography variant="h6" gutterBottom>
                    Disable Board On Failure
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    When enabled, a board experiencing a failure will be disabled to allow other boards to mine.
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Switch
                            checked={this.state.disable_board_on_failure}
                            onChange={this.handleDisableBoardOnFail}
                        />
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" color="textSecondary">
                            {this.state.disable_board_on_failure ? 'Enabled' : 'Disabled'}
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
                            this.props.handleApi('/disableboardonfailure', this.state, this.props.selected);
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
