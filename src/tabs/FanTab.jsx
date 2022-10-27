import * as React from 'react';
import {Button, TextField, Slider, Input, Typography, Grid} from '@mui/material';
import WindPowerIcon from '@mui/icons-material/WindPower';

export class FanTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {speed: 50, password: this.props.sessionPass};

        this.handleSlider = this.handleSlider.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
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
        const disabled = !this.state.password || !this.props.selected.length || this.props.disabled;

        return (
            <div className="tab-body" style={{minHeight: '140px'}}>
                <Typography gutterBottom>Fan Speed</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <WindPowerIcon />
                    </Grid>
                    <Grid item>
                        <Slider
                            value={typeof this.state.speed === 'number' ? this.state.speed : 1}
                            min={1}
                            onChange={this.handleSlider}
                            style={{width: '250px'}}
                            disabled={this.props.disabled}
                        />
                    </Grid>
                    <Grid item>
                        <Input
                            value={this.state.speed}
                            margin="dense"
                            onChange={this.handleInputChange}
                            onBlur={this.handleInputBlur}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    this.props.handleApi('/fanspeed', this.state, this.props.selected);
                                }
                            }}
                            inputProps={{step: 10, min: 1, max: 100, type: 'number'}}
                            disabled={this.props.disabled}
                        />
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
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !disabled) {
                                this.props.handleApi('/fanspeed', this.state, this.props.selected);
                            }
                        }}
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/fanspeed', this.state, this.props.selected);
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
