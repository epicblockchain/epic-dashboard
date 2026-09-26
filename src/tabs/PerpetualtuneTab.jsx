import * as React from 'react';
import {Button, TextField, Slider, Input, Switch, Typography, InputAdornment, Tooltip} from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InfoIcon from '@mui/icons-material/Info';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';
const MIN_THROTTLE = 10;
const POWER_TUNE_ALGORITHM = 'PowerTune';
const POWER_TUNE_MIN_THROTTLE = 1000;
const POWER_TUNE_MIN_STEP = 100;
const POWER_TUNE_DEFAULT_TARGET = 3000;
const DEFAULT_THROTTLE_STEP = 5;

function getThrottleLimits(algorithm) {
    const isPowerTune = algorithm === POWER_TUNE_ALGORITHM;
    return {
        minThrottle: isPowerTune ? POWER_TUNE_MIN_THROTTLE : MIN_THROTTLE,
        minStep: isPowerTune ? POWER_TUNE_MIN_STEP : 1,
        defaultStep: isPowerTune ? POWER_TUNE_MIN_STEP : DEFAULT_THROTTLE_STEP,
    };
}

export class PerpetualtuneTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            errorthrottle: true,
            algo: '',
            name: '',
            desc: '',
            num: 0,
            throttle: MIN_THROTTLE,
            step: DEFAULT_THROTTLE_STEP,
            min: 0,
            max: 0,
            password: this.props.sessionPass,
        };
        this.updateCheck = this.updateCheck.bind(this);
        this.updateErrorThrottle = this.updateErrorThrottle.bind(this);
        this.updateAlgorithm = this.updateAlgorithm.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleThrotChange = this.handleThrotChange.bind(this);
        this.handleThrotBlur = this.handleThrotBlur.bind(this);
        this.handleStepChange = this.handleStepChange.bind(this);
        this.handleStepBlur = this.handleStepBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const previousSelection = prevProps.selected || [];
        const selection = this.props.selected || [];
        const selectionChanged =
            previousSelection.length !== selection.length ||
            previousSelection.some((miner, index) => miner !== selection[index]);
        const perpetualTune = this.props.data?.[selection[0]]?.cap?.PerpetualTune || {};
        const algorithmAvailable = Object.values(perpetualTune).some(
            (algorithm) => algorithm?.algorithm === this.state.algo,
        );
        const resetAlgorithm = selectionChanged || (this.state.algo && !algorithmAvailable);
        const updates = {};

        if (resetAlgorithm) {
            Object.assign(updates, {
                algo: '',
                name: '',
                desc: '',
                num: 0,
                throttle: MIN_THROTTLE,
                step: DEFAULT_THROTTLE_STEP,
                min: 0,
                max: 0,
            });
        }
        if (prevProps.sessionPass != this.props.sessionPass) {
            updates.password = this.props.sessionPass;
        }
        if (Object.keys(updates).length > 0) {
            this.setState(updates);
        }
    }

    updateCheck(e) {
        this.setState({checked: e.target.checked});
    }

    updateErrorThrottle(e) {
        this.setState({errorthrottle: e.target.checked});
    }

    updateAlgorithm(e) {
        const algorithm = e.target.value;
        const min = Number(e.target.min);
        const max = Number(e.target.max);
        const {minThrottle, minStep, defaultStep} = getThrottleLimits(algorithm);
        const defaultTarget = algorithm === POWER_TUNE_ALGORITHM ? POWER_TUNE_DEFAULT_TARGET : min;
        const num = Math.min(max, Math.max(min, defaultTarget));
        this.setState({
            algo: algorithm,
            name: e.target.name,
            desc: e.target.id,
            min,
            max,
            num,
            throttle: Math.min(minThrottle, num - minStep),
            step: defaultStep,
        });
    }

    equalityCheck() {
        const {minThrottle, minStep} = getThrottleLimits(this.state.algo);
        if (this.state.throttle > this.state.num - minStep) {
            const newVal = Math.max(this.state.num - minStep, minThrottle);
            this.setState({throttle: newVal});
        }
    }

    handleSlider(e, newVal) {
        if (typeof newVal === 'number') {
            this.setState({num: newVal});
            return;
        }
        const {minStep} = getThrottleLimits(this.state.algo);
        this.setState({
            num: Math.max(newVal[1], Number(this.state.min), newVal[0] + minStep),
            throttle: newVal[0],
        });
    }

    handleInputChange(e) {
        this.setState({num: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleThrotChange(e) {
        this.setState({throttle: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleStepChange(e) {
        this.setState({step: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleInputBlur() {
        const {minStep} = getThrottleLimits(this.state.algo);
        const minTarget = Math.max(Number(this.state.min), Number(this.state.throttle) + minStep);
        if (this.state.num < minTarget) this.setState({num: minTarget});
        else if (this.state.num > this.state.max) this.setState({num: this.state.max});
        this.equalityCheck();
    }

    handleThrotBlur() {
        const {minThrottle, minStep} = getThrottleLimits(this.state.algo);
        const maxThrottle = Math.max(minThrottle, Number(this.state.num) - minStep);
        const value = Number(this.state.throttle);
        const throttle = Number.isFinite(value) ? value : minThrottle;
        this.setState({throttle: Math.min(Math.max(throttle, minThrottle), maxThrottle)});
    }

    handleStepBlur() {
        const {minStep} = getThrottleLimits(this.state.algo);
        const max = this.state.num - this.state.throttle;
        const value = Number(this.state.step);
        const step = Number.isFinite(value) ? value : minStep;
        this.setState({step: Math.min(Math.max(step, minStep), Math.max(minStep, max))});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        const disabled = !this.state.password || !this.props.selected.length || this.props.disabled;

        const algo_info = [];
        const marks = [
            {
                value: this.state.min,
                label: this.state.min,
            },
            {
                value: this.state.max,
                label: this.state.max,
            },
        ];

        if (this.props.data[this.props.selected[0]]) {
            if (this.props.data[this.props.selected[0]].cap) {
                const perpetualtune_cap = this.props.data[this.props.selected[0]].cap['PerpetualTune'];
                for (const i of Object.keys(perpetualtune_cap || {})) {
                    const algo = {
                        algorithm: perpetualtune_cap[i].algorithm,
                        name: perpetualtune_cap[i].name,
                        description: perpetualtune_cap[i].description,
                        min: perpetualtune_cap[i].min,
                        max: perpetualtune_cap[i].max,
                    };
                    algo_info.push(algo);
                }
            }
        }

        const hasMinThrot = this.state.algo !== '';
        const {minThrottle, minStep} = getThrottleLimits(this.state.algo);
        const unit = this.state.algo === POWER_TUNE_ALGORITHM ? 'W' : 'TH/s';
        const minTarget = Math.max(Number(this.state.min), Number(this.state.throttle) + minStep);

        return (
            <div className="tab-body settings-tab perpetual-tune-tab">
                <TabHeader
                    title="Perpetual Tune"
                    description="Choose an optimization mode and target for the selected miners."
                />
                <div className="perpetual-tune-layout">
                    <section className="perpetual-tune-section perpetual-tune-enable">
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    color="primary"
                                    checked={this.state.checked}
                                    onChange={this.updateCheck}
                                />
                            }
                            label={<Typography variant="body2">Perpetual Tuning</Typography>}
                        />
                    </section>

                    <section className="perpetual-tune-section perpetual-tune-options">
                        <FormControl disabled={!this.state.checked}>
                            <Typography variant="subtitle1" gutterBottom>
                                Perpetual Tune Algorithm
                            </Typography>
                            <RadioGroup value={this.state.algo}>
                                {algo_info.map((x, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={x.algorithm}
                                        label={x.name}
                                        name={x.name}
                                        control={
                                            <Radio
                                                size="small"
                                                onChange={this.updateAlgorithm}
                                                id={x.description}
                                                slotProps={{
                                                    input: {min: x.min, max: x.max},
                                                }}
                                            />
                                        }
                                    />
                                ))}
                            </RadioGroup>
                            <FormControlLabel
                                className="perpetual-error-toggle"
                                control={
                                    <Switch
                                        size="small"
                                        checked={this.state.errorthrottle}
                                        onChange={this.updateErrorThrottle}
                                        disabled={!this.state.checked}
                                    />
                                }
                                label="Error Throttle"
                            />
                        </FormControl>
                    </section>

                    <section className="perpetual-tune-section perpetual-tune-target">
                        {this.state.checked && algo_info.length > 0 && this.state.algo != '' ? (
                            <>
                                <Typography variant="subtitle1">{this.state.name}</Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    className="perpetual-tune-target-description"
                                    title={this.state.desc}
                                >
                                    {this.state.desc}
                                </Typography>
                                <div className="perpetual-tune-target-controls">
                                    <Slider
                                        value={hasMinThrot ? [this.state.throttle, this.state.num] : this.state.num}
                                        min={hasMinThrot ? minThrottle : Number(this.state.min)}
                                        max={Number(this.state.max)}
                                        step={minStep}
                                        marks={marks}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(x) => {
                                            if (x === this.state.throttle) {
                                                return 'Throttle';
                                            }
                                            return 'Target';
                                        }}
                                        onChange={this.handleSlider}
                                    />
                                    <div className="perpetual-tune-target-inputs">
                                        <FormControl>
                                            <Input
                                                value={this.state.num}
                                                onChange={this.handleInputChange}
                                                onBlur={this.handleInputBlur}
                                                endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
                                                style={{width: 90}}
                                                slotProps={{
                                                    input: {
                                                        step: minStep,
                                                        min: hasMinThrot ? minTarget : this.state.min,
                                                        max: this.state.max,
                                                        type: 'number',
                                                    },
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="textSecondary"
                                                component="div"
                                                className="perpetual-tune-input-label"
                                            >
                                                Target
                                            </Typography>
                                        </FormControl>
                                        {hasMinThrot && (
                                            <FormControl>
                                                <Input
                                                    value={this.state.throttle}
                                                    onChange={this.handleThrotChange}
                                                    onBlur={this.handleThrotBlur}
                                                    endAdornment={
                                                        <InputAdornment position="end">{unit}</InputAdornment>
                                                    }
                                                    style={{width: 90}}
                                                    slotProps={{
                                                        input: {
                                                            step: minStep,
                                                            min: minThrottle,
                                                            max: this.state.num - minStep,
                                                            type: 'number',
                                                        },
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    color="textSecondary"
                                                    component="div"
                                                    className="perpetual-tune-input-label"
                                                >
                                                    <span>Min Throttle</span>
                                                    <Tooltip
                                                        title="Minimum throttling hashrate before idling"
                                                        placement="right"
                                                    >
                                                        <InfoIcon className="perpetual-tune-info-icon" />
                                                    </Tooltip>
                                                </Typography>
                                            </FormControl>
                                        )}
                                        {hasMinThrot && (
                                            <FormControl>
                                                <Input
                                                    value={this.state.step}
                                                    onChange={this.handleStepChange}
                                                    onBlur={this.handleStepBlur}
                                                    endAdornment={
                                                        <InputAdornment position="end">{unit}</InputAdornment>
                                                    }
                                                    style={{width: 90}}
                                                    slotProps={{
                                                        input: {
                                                            step: minStep,
                                                            min: minStep,
                                                            max: this.state.num - this.state.throttle,
                                                            type: 'number',
                                                        },
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    color="textSecondary"
                                                    component="div"
                                                    className="perpetual-tune-input-label"
                                                >
                                                    <span>Throttle Step</span>
                                                    <Tooltip
                                                        title="Amount to step down when throttling"
                                                        placement="right"
                                                    >
                                                        <InfoIcon className="perpetual-tune-info-icon" />
                                                    </Tooltip>
                                                </Typography>
                                            </FormControl>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Typography variant="body2" color="textSecondary" className="perpetual-tune-placeholder">
                                Enable tuning and choose an algorithm to configure its target.
                            </Typography>
                        )}
                    </section>
                </div>

                <TabFooter className="perpetual-tune-actions">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !disabled) {
                                this.props.handleApi('/perpetualtune', this.state, this.props.selected);
                                if (this.state.checked) {
                                    this.props.handleApi('/perpetualtune/algo', this.state, this.props.selected);
                                    this.props.handleApi(
                                        '/perpetualtune/errorthrottle',
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
                            this.props.handleApi('/perpetualtune', this.state, this.props.selected);
                            if (this.state.checked) {
                                this.props.handleApi('/perpetualtune/algo', this.state, this.props.selected);
                                this.props.handleApi('/perpetualtune/errorthrottle', this.state, this.props.selected);
                            }
                        }}
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                    >
                        {getMinerActionLabel('Apply', this.props.selected)}
                    </Button>
                    <Button
                        onClick={() => {
                            this.props.handleApi('/perpetualtune/reset', this.state, this.props.selected);
                        }}
                        variant="outlined"
                        color="error"
                        disabled={disabled || !this.state.algo}
                    >
                        Reset Perpetual Tune
                    </Button>
                </TabFooter>
            </div>
        );
    }
}
