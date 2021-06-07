import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class RecalibrateTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {password: this.props.sessionPass};

        this.updatePassword = this.updatePassword.bind(this);
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField defaultValue={this.props.sessionPass} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/hwconfig', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.password || !this.props.selected.length}
                >
                    Recalibrate Hardware
                </Button>
            </div>
        );
    }
}