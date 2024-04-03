import * as React from 'react';
import {
    Button,
    TextField,
    Slider,
    Input,
    Typography,
    Grid,
    InputAdornment,
    Switch,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import WindPowerIcon from '@mui/icons-material/WindPower';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
export class FanTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autofan: false,
            target_temp: 60,
            idle_speed: 100,
            autofan_enabled: false,
            crit_temp_enabled: false,
            speed: 100,
            shutdowntemp: 85,
            criticaltemp: 110,
            password: this.props.sessionPass,
        };

        this.updateCheck = this.updateCheck.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
        this.handleShutdownTempSlider = this.handleShutdownTempSlider.bind(this);
        this.handleCritTempSlider = this.handleCritTempSlider.bind(this);
        this.handleShutdownTempInputChange = this.handleShutdownTempInputChange.bind(this);
        this.handleCritTempInputChange = this.handleCritTempInputChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleShutdownInputBlur = this.handleShutdownInputBlur.bind(this);
        this.handleCritInputBlur = this.handleCritInputBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.handleTargetTempInputChange = this.handleTargetTempInputChange.bind(this);
        this.handleTargetTempInputBlur = this.handleTargetTempInputBlur.bind(this);
        this.handleTargetTempSlider = this.handleTargetTempSlider.bind(this);
        this.handleIdleSpeedSlider = this.handleIdleSpeedSlider.bind(this);
        this.handleIdleSpeedInputChange = this.handleIdleSpeedInputChange.bind(this);
        this.handleIdleSpeedInputBlur = this.handleIdleSpeedInputBlur.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
        if (prevProps.selected != this.props.selected) {
            const data = this.props.data?.[this.props.selected[0]];
            if (data && data.sum.Fans && data.sum.Misc) {
                this.setState({speed: data.sum.Fans['Fans Speed']});
                if (data.sum.Fans['Fan Mode']) {
                    this.setState({autofan_enabled: true});
                    if (data.sum.Fans['Fan Mode']['Auto']) {
                        this.setState({
                            autofan: true,
                            target_temp: data.sum.Fans['Fan Mode']['Auto']['Target Temperature'],
                            idle_speed: data.sum.Fans['Fan Mode']['Auto']['Idle Speed'],
                        });
                    }
                }
                if (data.sum.Misc['Critical Temp']) {
                    this.setState({crit_temp_enabled: true, criticaltemp: data.sum.Misc['Critical Temp']});
                    if (this.state.shutdowntemp > data.sum.Misc['Critical Temp'] - 5) {
                        this.setState({shutdowntemp: data.sum.Misc['Critical Temp'] - 5});
                    }
                } else {
                    this.setState({
                        crit_temp_enabled: false,
                        criticaltemp: 110,
                    });
                }
                this.setState({shutdowntemp: data.sum.Misc['Shutdown Temp']});
            } else {
                this.setState({autofan_enabled: false, autofan: false, crit_temp_enabled: false, criticaltemp: 110});
            }
        }
    }

    updateCheck(e) {
        this.setState({autofan: e.target.checked});
    }

    handleSlider(e, newVal) {
        this.setState({speed: newVal});
    }

    handleShutdownTempSlider(e, newVal) {
        let clamped_val = Math.max(Math.min(newVal, 105), 60);
        this.setState({shutdowntemp: clamped_val});

        if (this.state.criticaltemp < clamped_val + 5) {
            this.setState({criticaltemp: clamped_val + 5});
        }
    }

    handleCritTempSlider(e, newVal) {
        let clamped_val = Math.max(Math.min(newVal, 110), 65);
        this.setState({criticaltemp: clamped_val});

        if (this.state.shutdowntemp > clamped_val - 5) {
            this.setState({shutdowntemp: clamped_val - 5});
        }
    }

    handleTargetTempSlider(e, newVal) {
        this.setState({target_temp: newVal});
    }

    handleInputChange(e) {
        this.setState({speed: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleShutdownTempInputChange(e) {
        this.setState({shutdowntemp: e.target.value == '' ? '' : Number(e.target.value)});
    }
    handleCritTempInputChange(e) {
        this.setState({criticaltemp: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleTargetTempInputChange(e) {
        this.setState({target_temp: e.target.value == '' ? '' : Number(e.target.value)});
    }
    handleTargetTempInputBlur(e) {
        if (this.state.target_temp < 60) this.setState({target_temp: 60});
        else if (this.state.target_temp > 100) this.setState({target_temp: 100});
    }

    handleIdleSpeedSlider(e, newVal) {
        this.setState({idle_speed: newVal});
    }

    handleIdleSpeedInputChange(e) {
        this.setState({idle_speed: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleIdleSpeedInputBlur(e) {
        if (this.state.idle_speed < 10) this.setState({idle_speed: 10});
        else if (this.state.idle_speed > 100) this.setState({idle_speed: 100});
    }

    handleShutdownInputBlur() {
        if (this.state.shutdowntemp < 60) {
            this.setState({shutdowntemp: 60});
        } else if (this.state.shutdowntemp > 105) {
            this.setState({shutdowntemp: 105});
            this.setState({criticaltemp: 110});
            if (this.state.criticaltemp < 110) this.setState({criticaltemp: 110});
        } else if (this.state.criticaltemp < this.state.shutdowntemp + 5) {
            this.setState({criticaltemp: this.state.shutdowntemp + 5});
        }
    }

    handleCritInputBlur() {
        if (this.state.criticaltemp < 65) {
            this.setState({criticaltemp: 65});
            this.setState({shutdowntemp: 60});
        } else if (this.state.criticaltemp > 110) {
            this.setState({criticaltemp: 110});
        } else if (this.state.shutdowntemp > this.state.criticaltemp - 5) {
            this.setState({shutdowntemp: this.state.criticaltemp - 5});
        }
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        const disabled = !this.state.password || !this.props.selected.length || this.props.disabled;

        return (
            <div className="tab-body" style={{minHeight: '40%'}}>
                <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={6}>
                        <Card style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography gutterBottom>Fan Speed</Typography>
                                    </Grid>
                                    {this.state.autofan_enabled ? (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                AutoFan
                                                <Switch
                                                    color="primary"
                                                    checked={this.state.autofan}
                                                    onChange={this.updateCheck}
                                                />
                                            </Typography>
                                        </Grid>
                                    ) : (
                                        <></>
                                    )}
                                    {this.state.autofan ? (
                                        <Grid item>
                                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                                Set the operating temperature of autofan
                                            </Typography>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <DeviceThermostatIcon color="primary" />
                                                </Grid>
                                                <Grid item>
                                                    <Slider
                                                        value={
                                                            typeof this.state.target_temp === 'number'
                                                                ? this.state.target_temp
                                                                : 60
                                                        }
                                                        min={45}
                                                        onChange={this.handleTargetTempSlider}
                                                        style={{width: '250px'}}
                                                        disabled={this.props.disabled || this.state.lock}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Input
                                                        value={this.state.target_temp}
                                                        margin="dense"
                                                        endAdornment={
                                                            <InputAdornment position="end">{'\u00b0C'}</InputAdornment>
                                                        }
                                                        onChange={this.handleTargetTempInputChange}
                                                        onBlur={this.handleTargetTempInputBlur}
                                                        inputProps={{step: 5, min: 45, max: 100, type: 'number'}}
                                                        disabled={this.props.disabled || this.state.lock}
                                                        style={{width: '70px'}}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                                Set the fan speed when Idling
                                            </Typography>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <WindPowerIcon color="primary" />
                                                </Grid>
                                                <Grid item>
                                                    <Slider
                                                        value={
                                                            typeof this.state.idle_speed === 'number'
                                                                ? this.state.idle_speed
                                                                : 100
                                                        }
                                                        min={10}
                                                        onChange={this.handleIdleSpeedSlider}
                                                        style={{width: '250px'}}
                                                        disabled={this.props.disabled || this.state.lock}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Input
                                                        value={this.state.idle_speed}
                                                        margin="dense"
                                                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                                        onChange={this.handleIdleSpeedInputChange}
                                                        onBlur={this.handleIdleSpeedInputBlur}
                                                        inputProps={{step: 10, min: 10, max: 100, type: 'number'}}
                                                        disabled={this.props.disabled || this.state.lock}
                                                        style={{width: '70px'}}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <>
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
                                                            this.props.handleApi(
                                                                '/fanspeed',
                                                                this.state,
                                                                this.props.selected
                                                            );
                                                        }
                                                    }}
                                                    inputProps={{step: 10, min: 1, max: 100, type: 'number'}}
                                                    disabled={this.props.disabled}
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </CardContent>
                            <CardActions style={{marginTop: 'auto'}}>
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
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12}>
                                        <Typography gutterBottom>Shutdown Temperature</Typography>
                                    </Grid>
                                    <Grid item>
                                        <ThermostatIcon />
                                    </Grid>
                                    <Grid item>
                                        <Slider
                                            value={
                                                typeof this.state.shutdowntemp === 'number'
                                                    ? this.state.shutdowntemp
                                                    : 60
                                            }
                                            min={60}
                                            max={110}
                                            onChange={this.handleShutdownTempSlider}
                                            style={{width: '250px'}}
                                            disabled={this.props.disabled}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Input
                                            value={this.state.shutdowntemp}
                                            margin="dense"
                                            onChange={this.handleShutdownTempInputChange}
                                            onBlur={this.handleShutdownInputBlur}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    this.props.handleApi(
                                                        '/shutdowntemp',
                                                        this.state,
                                                        this.props.selected
                                                    );
                                                }
                                            }}
                                            inputProps={{step: 5, min: 60, max: 110, type: 'number'}}
                                            disabled={this.props.disabled}
                                        />
                                    </Grid>
                                </Grid>
                                {this.state.crit_temp_enabled ? (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12}>
                                            <Typography gutterBottom>Critical Temperature</Typography>
                                        </Grid>
                                        <Grid item>
                                            <ThermostatIcon />
                                        </Grid>
                                        <Grid item>
                                            <Slider
                                                value={
                                                    typeof this.state.criticaltemp === 'number'
                                                        ? this.state.criticaltemp
                                                        : 110
                                                }
                                                min={60}
                                                max={110}
                                                onChange={this.handleCritTempSlider}
                                                style={{width: '250px'}}
                                                disabled={this.props.disabled}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Input
                                                value={this.state.criticaltemp}
                                                margin="dense"
                                                onChange={this.handleCritTempInputChange}
                                                onBlur={this.handleCritInputBlur}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        this.props.handleApi(
                                                            '/critcaltemp',
                                                            this.state,
                                                            this.props.selected
                                                        );
                                                    }
                                                }}
                                                inputProps={{step: 5, min: 60, max: 110, type: 'number'}}
                                                disabled={this.props.disabled}
                                            />
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <></>
                                )}
                            </CardContent>
                            <CardActions style={{marginTop: 'auto'}}>
                                <Button
                                    onClick={() => {
                                        if (this.state.crit_temp_enabled) {
                                            this.props.handleApi('/criticaltemp', this.state, this.props.selected);
                                        }
                                        this.props.handleApi('/shutdowntemp', this.state, this.props.selected);
                                    }}
                                    variant="contained"
                                    color="primary"
                                    disabled={disabled}
                                >
                                    Apply
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
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
        );
    }
}
