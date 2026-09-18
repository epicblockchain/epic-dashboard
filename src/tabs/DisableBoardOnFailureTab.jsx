import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch} from '@mui/material';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';

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
            <div className="tab-body settings-tab">
                <TabHeader
                    title="Disable Board On Failure"
                    description="Automatically disable a failed board so the remaining boards can continue mining."
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
                            checked={this.state.disable_board_on_failure}
                            onChange={this.handleDisableBoardOnFail}
                        />
                    </Grid>
                    <Grid>
                        <Typography variant="body2" color="textSecondary">
                            {this.state.disable_board_on_failure ? 'Enabled' : 'Disabled'}
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
                            this.props.handleApi('/disableboardonfailure', this.state, this.props.selected);
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
