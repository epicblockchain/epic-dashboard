import * as React from 'react';
import { Button, TextField, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';

export class OpModeTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mode: 'normal', password: ''};

        this.updateMode = this.updateMode.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }
    
    updateMode(e) {
        this.setState({mode: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <RadioGroup row onChange={this.updateMode} value={this.state.mode}>
                    <FormControlLabel
                        value="normal"
                        control={<Radio color="primary"/>}
                        label="Normal"
                        labelPlacement="end"
                    />
                    <FormControlLabel
                        value="efficiency"
                        control={<Radio color="primary"/>}
                        label="Efficiency"
                        labelPlacement="end"
                    />
                </RadioGroup>
                <TextField variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/mode', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.mode || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}