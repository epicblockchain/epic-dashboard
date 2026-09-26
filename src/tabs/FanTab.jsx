import * as React from 'react';
import {Button, TextField, Slider, Input, Typography, InputAdornment, Switch, Tooltip} from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WarningIcon from '@mui/icons-material/Warning';
import WindPowerIcon from '@mui/icons-material/WindPower';
import TimerIcon from '@mui/icons-material/Timer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';
import './SystemTab.css';

const MAX_FANS = 4;
const MAX_PREINIT_COOLDOWN_DURATION = 600;

function hasSelectionChanged(previousSelection = [], selection = []) {
    return (
        previousSelection.length !== selection.length ||
        previousSelection.some((miner, index) => miner !== selection[index])
    );
}

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
            min_working_fans: 0,
            preinit_cooldown_max_duration: 300,
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
        this.handleMinWorkingFansSlider = this.handleMinWorkingFansSlider.bind(this);
        this.handleMinWorkingFansInputChange = this.handleMinWorkingFansInputChange.bind(this);
        this.handleMinWorkingFansBlur = this.handleMinWorkingFansBlur.bind(this);
        this.handlePreinitCooldownSlider = this.handlePreinitCooldownSlider.bind(this);
        this.handlePreinitCooldownInputChange = this.handlePreinitCooldownInputChange.bind(this);
        this.handlePreinitCooldownBlur = this.handlePreinitCooldownBlur.bind(this);
    }

    componentDidMount() {
        this.syncSelectedMinerSettings();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
        if (hasSelectionChanged(prevProps.selected, this.props.selected)) {
            this.syncSelectedMinerSettings();
        }
    }

    syncSelectedMinerSettings() {
        const data = this.props.data?.[this.props.selected[0]];
        const nextState = {};

        if (data && data.sum?.Fans && data.sum?.Misc) {
            const fans = data.sum.Fans;
            const misc = data.sum.Misc;
            const fanMode = fans['Fan Mode'];
            const autoFan = fanMode?.Auto;
            const criticalTemp = misc['Critical Temp'];

            nextState.speed = fans['Fans Speed'];
            nextState.autofan_enabled = Boolean(fanMode);
            nextState.autofan = Boolean(autoFan);
            if (autoFan) {
                nextState.target_temp = autoFan['Target Temperature'];
                nextState.idle_speed = autoFan['Idle Speed'];
            }

            nextState.crit_temp_enabled = Boolean(criticalTemp);
            nextState.criticaltemp = criticalTemp || 110;
            nextState.shutdowntemp = misc['Shutdown Temp'];
        } else {
            nextState.autofan_enabled = false;
            nextState.autofan = false;
            nextState.crit_temp_enabled = false;
            nextState.criticaltemp = 110;
        }

        if (data?.sum?.Fans) {
            nextState.min_working_fans = data.sum.Fans['Minimum Working Fans'];
        } else {
            nextState.min_working_fans = 0;
        }

        if (data?.sum?.['PreInitCooldown Max Duration'] !== undefined) {
            nextState.preinit_cooldown_max_duration = data.sum['PreInitCooldown Max Duration'];
        }

        this.setState(nextState);
    }

    updateCheck(e) {
        this.setState({autofan: e.target.checked});
    }

    handleSlider(e, newVal) {
        this.setState({speed: newVal});
    }

    handleShutdownTempSlider(e, newVal) {
        const clamped_val = Math.max(Math.min(newVal, 105), 60);
        this.setState({shutdowntemp: clamped_val});

        if (this.state.criticaltemp < clamped_val + 5) {
            this.setState({criticaltemp: clamped_val + 5});
        }
    }

    handleCritTempSlider(e, newVal) {
        const clamped_val = Math.max(Math.min(newVal, 110), 65);
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

    handleMinWorkingFansSlider(e, newVal) {
        this.setState({min_working_fans: newVal});
    }

    handleMinWorkingFansInputChange(e) {
        this.setState({min_working_fans: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleMinWorkingFansBlur() {
        if (this.state.min_working_fans < 0) {
            this.setState({min_working_fans: 0});
        } else if (this.state.min_working_fans > MAX_FANS) {
            this.setState({min_working_fans: MAX_FANS});
        }
    }

    handlePreinitCooldownSlider(e, newVal) {
        this.setState({preinit_cooldown_max_duration: newVal});
    }

    handlePreinitCooldownInputChange(e) {
        this.setState({preinit_cooldown_max_duration: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handlePreinitCooldownBlur() {
        if (this.state.preinit_cooldown_max_duration < 0) {
            this.setState({preinit_cooldown_max_duration: 0});
        } else if (this.state.preinit_cooldown_max_duration > MAX_PREINIT_COOLDOWN_DURATION) {
            this.setState({preinit_cooldown_max_duration: MAX_PREINIT_COOLDOWN_DURATION});
        }
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        const disabled = !this.state.password || !this.props.selected.length || this.props.disabled;
        const supportsPreInitCooldown =
            this.props.selected.length > 0 &&
            this.props.selected.every((index) => {
                const duration = this.props.data?.[index]?.sum?.['PreInitCooldown Max Duration'];
                return duration !== undefined && duration !== null;
            });

        return (
            <div className="tab-body settings-tab cooling-tab">
                <TabHeader
                    title="Cooling"
                    description="Configure fan behavior, temperature limits, and cooldown safeguards."
                />
                <div className="cooling-layout">
                    <section className="cooling-section">
                        <Typography className="compact-section-title">Fan settings</Typography>
                        {this.state.autofan_enabled && (
                            <div className="cooling-mode-row">
                                <Typography variant="body2">AutoFan</Typography>
                                <div className="cooling-mode-toggle">
                                    <Typography variant="caption">
                                        {this.state.autofan ? 'Automatic' : 'Manual'}
                                    </Typography>
                                    <Switch
                                        size="small"
                                        color="primary"
                                        checked={this.state.autofan}
                                        onChange={this.updateCheck}
                                    />
                                </div>
                            </div>
                        )}
                        {this.state.autofan ? (
                            <>
                                <div className="cooling-setting">
                                    <Typography className="cooling-control-label">Target temperature</Typography>
                                    <div className="cooling-control-row">
                                        <DeviceThermostatIcon color="primary" />
                                        <Slider
                                            value={
                                                typeof this.state.target_temp === 'number' ? this.state.target_temp : 60
                                            }
                                            min={45}
                                            onChange={this.handleTargetTempSlider}
                                            disabled={this.props.disabled || this.state.lock}
                                            aria-label="AutoFan target temperature"
                                        />
                                        <Input
                                            value={this.state.target_temp}
                                            margin="dense"
                                            endAdornment={<InputAdornment position="end">{'\u00b0C'}</InputAdornment>}
                                            onChange={this.handleTargetTempInputChange}
                                            onBlur={this.handleTargetTempInputBlur}
                                            disabled={this.props.disabled || this.state.lock}
                                            style={{width: '70px'}}
                                            slotProps={{input: {step: 5, min: 45, max: 100, type: 'number'}}}
                                        />
                                    </div>
                                </div>
                                <div className="cooling-setting">
                                    <Typography className="cooling-control-label">Idle fan speed</Typography>
                                    <div className="cooling-control-row">
                                        <WindPowerIcon color="primary" />
                                        <Slider
                                            value={
                                                typeof this.state.idle_speed === 'number' ? this.state.idle_speed : 100
                                            }
                                            min={10}
                                            onChange={this.handleIdleSpeedSlider}
                                            disabled={this.props.disabled || this.state.lock}
                                            aria-label="Idle fan speed"
                                        />
                                        <Input
                                            value={this.state.idle_speed}
                                            margin="dense"
                                            endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                            onChange={this.handleIdleSpeedInputChange}
                                            onBlur={this.handleIdleSpeedInputBlur}
                                            disabled={this.props.disabled || this.state.lock}
                                            style={{width: '70px'}}
                                            slotProps={{input: {step: 10, min: 10, max: 100, type: 'number'}}}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="cooling-setting">
                                <Typography className="cooling-control-label">Fan speed</Typography>
                                <div className="cooling-control-row">
                                    <WindPowerIcon />
                                    <Slider
                                        value={typeof this.state.speed === 'number' ? this.state.speed : 1}
                                        min={1}
                                        onChange={this.handleSlider}
                                        disabled={this.props.disabled}
                                        aria-label="Fan speed"
                                    />
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
                                        disabled={this.props.disabled}
                                        style={{width: '70px'}}
                                        slotProps={{input: {step: 10, min: 1, max: 100, type: 'number'}}}
                                    />
                                </div>
                            </div>
                        )}
                    </section>
                    <section className="cooling-section">
                        <Typography className="compact-section-title">Temperature limits</Typography>
                        <div className="cooling-setting">
                            <Typography className="cooling-control-label">Shutdown temperature</Typography>
                            <div className="cooling-control-row">
                                <ThermostatIcon />
                                <Slider
                                    value={typeof this.state.shutdowntemp === 'number' ? this.state.shutdowntemp : 60}
                                    min={60}
                                    max={110}
                                    onChange={this.handleShutdownTempSlider}
                                    disabled={this.props.disabled}
                                    aria-label="Shutdown temperature"
                                />
                                <Input
                                    value={this.state.shutdowntemp}
                                    margin="dense"
                                    endAdornment={<InputAdornment position="end">{'\u00b0C'}</InputAdornment>}
                                    onChange={this.handleShutdownTempInputChange}
                                    onBlur={this.handleShutdownInputBlur}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            this.props.handleApi('/shutdowntemp', this.state, this.props.selected);
                                        }
                                    }}
                                    disabled={this.props.disabled}
                                    style={{width: '70px'}}
                                    slotProps={{input: {step: 5, min: 60, max: 110, type: 'number'}}}
                                />
                            </div>
                        </div>
                        {this.state.crit_temp_enabled && (
                            <div className="cooling-setting">
                                <Typography className="cooling-control-label">Critical temperature</Typography>
                                <div className="cooling-control-row">
                                    <ThermostatIcon />
                                    <Slider
                                        value={
                                            typeof this.state.criticaltemp === 'number' ? this.state.criticaltemp : 110
                                        }
                                        min={60}
                                        max={110}
                                        onChange={this.handleCritTempSlider}
                                        disabled={this.props.disabled}
                                        aria-label="Critical temperature"
                                    />
                                    <Input
                                        value={this.state.criticaltemp}
                                        margin="dense"
                                        endAdornment={<InputAdornment position="end">{'\u00b0C'}</InputAdornment>}
                                        onChange={this.handleCritTempInputChange}
                                        onBlur={this.handleCritInputBlur}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                this.props.handleApi('/criticaltemp', this.state, this.props.selected);
                                            }
                                        }}
                                        disabled={this.props.disabled}
                                        style={{width: '70px'}}
                                        slotProps={{input: {step: 5, min: 60, max: 110, type: 'number'}}}
                                    />
                                </div>
                            </div>
                        )}
                    </section>
                    <section className="cooling-section">
                        <Typography className="compact-section-title">Fan safeguards</Typography>
                        <div className="cooling-setting">
                            <Typography className="cooling-control-label">Minimum working fans</Typography>
                            <div className="cooling-control-row">
                                <WarningIcon />
                                <Slider
                                    value={
                                        typeof this.state.min_working_fans === 'number'
                                            ? this.state.min_working_fans
                                            : 0
                                    }
                                    min={0}
                                    max={MAX_FANS}
                                    onChange={this.handleMinWorkingFansSlider}
                                    disabled={this.props.disabled}
                                    valueLabelDisplay="auto"
                                    marks
                                    aria-label="Minimum working fans"
                                />
                                <Input
                                    value={this.state.min_working_fans}
                                    margin="dense"
                                    onChange={this.handleMinWorkingFansInputChange}
                                    onBlur={this.handleMinWorkingFansBlur}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            this.props.handleApi('/fans/minimum', this.state, this.props.selected);
                                        }
                                    }}
                                    disabled={this.props.disabled}
                                    style={{width: '70px'}}
                                    slotProps={{input: {step: 1, min: 0, max: MAX_FANS, type: 'number'}}}
                                />
                            </div>
                        </div>
                        {supportsPreInitCooldown && (
                            <div className="cooling-setting">
                                <Tooltip
                                    title="Sets the PreInitCooldown maximum duration in seconds. This is the maximum time the miner can spend in PreInitCooldown. If the max duration is reached, the miner will skip the initialization temperature checks and start mining. Default is 300 seconds. Setting to 0 means the PreInitCooldown state will last for at most 0 seconds."
                                    arrow
                                    placement="top"
                                >
                                    <span className="cooling-control-label cooling-help-label">
                                        PreInit cooldown max duration
                                        <InfoOutlinedIcon fontSize="small" />
                                    </span>
                                </Tooltip>
                                <div className="cooling-control-row">
                                    <TimerIcon />
                                    <Slider
                                        value={
                                            typeof this.state.preinit_cooldown_max_duration === 'number'
                                                ? this.state.preinit_cooldown_max_duration
                                                : 0
                                        }
                                        min={0}
                                        max={MAX_PREINIT_COOLDOWN_DURATION}
                                        onChange={this.handlePreinitCooldownSlider}
                                        disabled={this.props.disabled}
                                        valueLabelDisplay="auto"
                                        aria-label="PreInit cooldown max duration"
                                    />
                                    <Input
                                        value={this.state.preinit_cooldown_max_duration}
                                        margin="dense"
                                        endAdornment={<InputAdornment position="end">s</InputAdornment>}
                                        onChange={this.handlePreinitCooldownInputChange}
                                        onBlur={this.handlePreinitCooldownBlur}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                this.props.handleApi(
                                                    '/preinitcooldownmaxduration',
                                                    this.state,
                                                    this.props.selected,
                                                );
                                            }
                                        }}
                                        disabled={this.props.disabled}
                                        style={{width: '70px'}}
                                        slotProps={{
                                            input: {
                                                step: 10,
                                                min: 0,
                                                max: MAX_PREINIT_COOLDOWN_DURATION,
                                                type: 'number',
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </section>
                </div>
                <TabFooter className="multi-action-footer">
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
                                this.props.handleApi('/fans/minimum', this.state, this.props.selected);
                                if (supportsPreInitCooldown) {
                                    this.props.handleApi(
                                        '/preinitcooldownmaxduration',
                                        this.state,
                                        this.props.selected,
                                    );
                                }
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
                        {getMinerActionLabel('Apply Fan', this.props.selected)}
                    </Button>
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
                        {getMinerActionLabel('Apply Temps', this.props.selected)}
                    </Button>
                    <Button
                        onClick={() => {
                            this.props.handleApi('/fans/minimum', this.state, this.props.selected);
                        }}
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                    >
                        {getMinerActionLabel('Apply Min Fans', this.props.selected)}
                    </Button>
                    {supportsPreInitCooldown && (
                        <Button
                            onClick={() => {
                                this.props.handleApi('/preinitcooldownmaxduration', this.state, this.props.selected);
                            }}
                            variant="contained"
                            color="primary"
                            disabled={disabled}
                        >
                            {getMinerActionLabel('Apply Cooldown', this.props.selected)}
                        </Button>
                    )}
                </TabFooter>
            </div>
        );
    }
}
