import * as React from 'react';
import FlashOn from '@mui/icons-material/FlashOn';
import Schedule from '@mui/icons-material/Schedule';
import {Button, TextField, Slider, Input, Grid, Typography} from '@mui/material';

const marksCLK = [
    {
        value: 50,
        label: '50 MHz',
    },
    {
        value: 1000,
        label: '1000 MHz',
    },
];

const marksVOLT = [
    {
        value: 12.0,
        label: '12 V',
    },
    {
        value: 15,
        label: '15 V',
    },
];

export class TuneTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            voltage: '',
            clock: '',
            password: this.props.sessionPass,
        };

        this.handleSliderClockChange = this.handleSliderClockChange.bind(this);
        this.handleInputClockChange = this.handleInputClockChange.bind(this);
        this.handleSliderVoltageChange = this.handleSliderVoltageChange.bind(this);
        this.handleInputVoltageChange = this.handleInputVoltageChange.bind(this);
        this.handleInputClockBlur = this.handleInputClockBlur.bind(this);
        this.handleInputVoltageBlur = this.handleInputVoltageBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    handleSliderClockChange(e, newVal) {
        this.setState({clock: newVal});
    }

    handleInputClockChange(e) {
        this.setState({clock: e.target.value === '' ? '' : Math.round(Number(e.target.value))});
    }

    handleSliderVoltageChange(e, newVal) {
        this.setState({voltage: newVal});
    }

    handleInputVoltageChange(e) {
        this.setState({voltage: e.target.value === '' ? '' : Math.round(Number(e.target.value) * 1000) / 1000});
    }

    handleInputClockBlur() {
        if (this.state.clock < 50) this.setState({clock: 50});
        else if (this.state.clock > 1000) this.setState({clock: 500});
    }
    handleInputVoltageBlur() {
        if (this.state.voltage < 12) this.setState({voltage: 12});
        else if (this.state.voltage > 15) this.setState({voltage: 15});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        const disabled =
            !this.state.password ||
            !this.props.selected.length ||
            this.props.disabled ||
            !this.state.clock ||
            !this.state.voltage;

        return (
            <div className="tab-body" style={{minHeight: '140px'}}>
                <Typography gutterBottom>Change Clock or Voltage settings</Typography>
                <Grid container spacing={2} alignItems="center" style={{width: '450px'}}>
                    <Grid item xs={2}>
                        <Schedule />
                    </Grid>
                    <Grid item xs={8}>
                        <Slider
                            value={typeof this.state.clock === 'number' ? this.state.clock : 50}
                            min={50}
                            max={1000}
                            marks={marksCLK}
                            onChange={this.handleSliderClockChange}
                            style={{width: '250px'}}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            value={this.state.clock}
                            margin="dense"
                            onChange={this.handleInputClockChange}
                            onBlur={this.handleInputClockBlur}
                            inputProps={{step: 5, min: 50, max: 1000, type: 'number'}}
                            style={{width: '70px'}}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <FlashOn />
                    </Grid>
                    <Grid item xs={8}>
                        <Slider
                            value={typeof this.state.voltage === 'number' ? this.state.voltage : 12.0}
                            min={12.0}
                            max={15.0}
                            step={0.001}
                            marks={marksVOLT}
                            onChange={this.handleSliderVoltageChange}
                            style={{width: '250px'}}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            value={this.state.voltage}
                            margin="dense"
                            onChange={this.handleInputVoltageChange}
                            onBlur={this.handleInputVoltageBlur}
                            inputProps={{step: 0.05, min: 12, max: 15, type: 'number'}}
                            style={{width: '70px'}}
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
                                this.props.handleApi('/tune', this.state, this.props.selected);
                            }
                        }}
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/tune', this.state, this.props.selected);
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
