import * as React from 'react';
import {Button, TextField, Slider, Input, Typography, Grid} from '@mui/material';
import WindPowerIcon from '@mui/icons-material/WindPower';
import ThermostatIcon from '@mui/icons-material/Thermostat';

export class FanTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {speed: 100, shutdowntemp: 85, password: this.props.sessionPass};

        this.handleSlider = this.handleSlider.bind(this);
        this.handleTempSlider = this.handleTempSlider.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleTempInputChange = this.handleTempInputChange.bind(this);
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

    handleTempSlider(e, newVal) {
        this.setState({shutdowntemp: newVal});
    }

    handleInputChange(e) {
        this.setState({speed: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleTempInputChange(e) {
        this.setState({shutdowntemp: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleInputBlur() {
        if (this.state.speed < 1) this.setState({speed: 1});
        else if (this.state.speed > 100) this.setState({speed: 100});

        if (this.state.shutdowntemp < 60) this.setState({shutdowntemp: 60});
        else if (this.state.shutdowntemp > 95) this.setState({shutdowntemp: 95});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        const disabled = !this.state.password || !this.props.selected.length || this.props.disabled;

        return (
            <div className="tab-body" style={{minHeight: '140px'}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item container spacing={2} style={{width: '700px'}}>
                        <Grid item xs={12}>
                            <Typography gutterBottom>Fan Speed</Typography>
                        </Grid>

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
                        <Grid item>
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
                        </Grid>

                        <Grid item xs={12}>
                            <Typography gutterBottom>Shutdown Temperature</Typography>
                        </Grid>
                        <Grid item>
                            <ThermostatIcon />
                        </Grid>
                        <Grid item>
                            <Slider
                                value={typeof this.state.shutdowntemp === 'number' ? this.state.shutdowntemp : 60}
                                min={60}
                                max={95}
                                onChange={this.handleTempSlider}
                                style={{width: '250px'}}
                                disabled={this.props.disabled}
                            />
                        </Grid>
                        <Grid item>
                            <Input
                                value={this.state.shutdowntemp}
                                margin="dense"
                                onChange={this.handleTempInputChange}
                                onBlur={this.handleInputBlur}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        this.props.handleApi('/shutdowntemp', this.state, this.props.selected);
                                    }
                                }}
                                inputProps={{step: 5, min: 60, max: 95, type: 'number'}}
                                disabled={this.props.disabled}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                onClick={() => {
                                    this.props.handleApi('/shutdowntemp', this.state, this.props.selected);
                                }}
                                variant="contained"
                                color="primary"
                                disabled={disabled}
                            >
                                Apply
                            </Button>
                        </Grid>
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
                                this.props.handleApi('/shutdowntemp', this.state, this.props.selected);
                            }
                        }}
                        error={!this.state.password}
                    />
                </div>
            </div>
        );
    }
}
