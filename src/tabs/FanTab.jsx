import * as React from 'react';
import { Button, TextField, Slider, Input, Typography, Grid } from '@material-ui/core';
import ToysIcon from '@material-ui/icons/Toys';

export class FanTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {speed: 50, password: ''};

        this.handleSlider = this.handleSlider.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    handleSlider(e, newVal) {
        this.setState({speed: newVal});
    }

    handleInputChange(e) {
        this.setState({speed: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleInputBlur() {
        if (this.state.speed < 1) this.setState({speed: 1});
        else if (this.state.speed > 100) this.setState({speed: 100});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return (
            <div style={{padding: '12px 0'}}>
                <Typography gutterBottom>Fan Speed</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <ToysIcon/>
                    </Grid>
                    <Grid item>
                        <Slider value={typeof this.state.speed === 'number' ? this.state.speed : 1} min={1}
                            onChange={this.handleSlider} style={{width: '250px'}} disabled={this.props.disabled}
                        />
                    </Grid>
                    <Grid item>
                        <Input value={this.state.speed} margin="dense" onChange={this.handleInputChange} onBlur={this.handleInputBlur}
                            inputProps={{step: 10, min: 1, max: 100, type: 'number'}} disabled={this.props.disabled}
                        />
                    </Grid>
                </Grid>
                <TextField variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/fanspeed', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.speed || !this.state.password || !this.props.selected.length || this.props.disabled}
                >
                    Apply
                </Button>
            </div>
        );
    }
}