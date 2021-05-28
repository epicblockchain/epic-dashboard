import * as React from 'react';
import { Button, TextField, Switch, FormControl, FormControlLabel } from '@material-ui/core';

export class LedTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {checked: true, password: ''};

        this.updateCheck = this.updateCheck.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }
    
    updateCheck(e) {
        this.setState({checked: e.target.checked});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <FormControl margin="dense">
                    <FormControlLabel
                        control={<Switch color="primary" checked={this.state.checked} onChange={this.updateCheck}/>}
                        label="Turn on LED indicator"
                    />
                </FormControl>
                <TextField variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/identify', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}