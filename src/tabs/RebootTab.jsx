import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class RebootTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {delay: '0', password: this.props.sessionPass};

        this.updateDelay = this.updateDelay.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }
    
    updateDelay(e) {
        console.log(typeof e.target.value);
        this.setState({delay: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="Reboot Delay" type="number" onChange={this.updateDelay}
                    value={this.state.delay} helperText="(seconds)" margin="dense"
                />
                <TextField value={this.state.password || ''} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/reboot', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={this.state.delay < '0' || !this.state.password || !this.props.selected.length}
                >
                    Reboot
                </Button>
                <Button onClick={() => {
                        this.props.handleApi('/softreboot', this.state, this.props.selected);
                    }} variant="contained" color="secondary"
                    disabled={this.state.delay < '0' || !this.state.password || !this.props.selected.length}
                >
                    Soft Reboot
                </Button>
            </div>
        );
    }
}