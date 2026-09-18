import * as React from 'react';
import {styled} from '@mui/material/styles';
import {
    Box,
    Button,
    TextField,
    Slider,
    Input,
    Switch,
    Typography,
    Grid,
    Divider,
    InputAdornment,
    Tooltip,
} from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InfoIcon from '@mui/icons-material/Info';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';
const MIN_THROTTLE = 10;
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
            step: 5,
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
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateCheck(e) {
        this.setState({checked: e.target.checked});
    }

    updateErrorThrottle(e) {
        this.setState({errorthrottle: e.target.checked});
    }

    updateAlgorithm(e) {
        this.setState({algo: e.target.value});
        this.setState({name: e.target.name});
        this.setState({desc: e.target.id});
        this.setState({min: Number(e.target.min)});
        this.setState({max: Number(e.target.max)});
        this.setState({num: Number(e.target.min)});
    }

    equalityCheck() {
        if (this.state.throttle > this.state.num) {
            const newVal = Math.max(this.state.num, MIN_THROTTLE);
            this.setState({throttle: newVal});
        }
    }

    handleSlider(e, newVal) {
        if (typeof newVal === 'number') {
            this.setState({num: newVal});
            return;
        }
        this.setState({num: Math.max(newVal[1], this.state.min ?? 60), throttle: newVal[0]});
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
        if (this.state.num < this.state.min) this.setState({num: this.state.min});
        else if (this.state.num > this.state.max) this.setState({num: this.state.max});
        this.equalityCheck();
    }

    handleThrotBlur() {
        if (this.state.throttle < 10) this.setState({throttle: 10});
        if (this.state.num < this.state.throttle) this.setState({throt: this.state.num});
        this.equalityCheck();
    }

    handleStepBlur() {
        if (this.state.step < 1) this.setState({step: 1});
        const max = this.state.num - this.state.throttle;
        if (this.state.step > max) this.setState({step: max});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        const disabled = !this.state.password || !this.props.selected.length || this.props.disabled;

        const MuiSwitchLarge = styled(Switch)(({theme}) => ({
            width: 88,
            height: 34,
            padding: 7,
            '& .MuiSwitch-switchBase': {
                margin: 1,
                padding: 0,
                transform: 'translateX(6px)',
                '&.Mui-checked': {
                    transform: 'translateX(50px)',
                },
            },
            '& .MuiSwitch-thumb': {
                width: 32,
                height: 32,
            },
            '& .MuiSwitch-track': {
                borderRadius: 20 / 2,
            },
        }));

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

        let hasMinThrot = false;
        if (this.state.algo === 'VoltageOptimizer' || this.state.algo === 'BoardTune') {
            hasMinThrot = true;
        }

        return (
            <div className="tab-body settings-tab perpetual-tune-tab">
                <TabHeader
                    title="Perpetual Tune"
                    description="Choose an optimization mode and target for the selected miners."
                />
                <Grid container spacing={2}>
                    <Grid
                        container
                        spacing={2}
                        style={{width: '275px'}}
                        sx={{
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                pl: 4,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <MuiSwitchLarge
                                        color="primary"
                                        checked={this.state.checked}
                                        onChange={this.updateCheck}
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            fontSize: 20,
                                        }}
                                    >
                                        Perpetual Tuning
                                    </Box>
                                }
                                labelPlacement="top"
                            />
                        </Box>
                    </Grid>
                    <Divider orientation="vertical" sx={{pt: 25}} style={{marginRight: '25px'}} />

                    <FormControl disabled={!this.state.checked}>
                        <Typography
                            sx={{
                                fontSize: 20,
                            }}
                        >
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
                            control={
                                <Switch
                                    checked={this.state.errorthrottle}
                                    onChange={this.updateErrorThrottle}
                                    disabled={!this.state.checked}
                                />
                            }
                            label="Error Throttle"
                        />
                    </FormControl>

                    <Divider orientation="vertical" sx={{pt: 25}} style={{margin: '0 25px'}} />
                    <Grid hidden={!this.state.checked || algo_info.length == 0 || this.state.algo == ''} size="grow">
                        <Typography
                            sx={{
                                fontSize: 20,
                            }}
                        >
                            {this.state.name}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 14,
                            }}
                        >
                            {this.state.desc}
                        </Typography>
                        <br />
                        <Grid
                            container
                            spacing={2}
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <Grid size="auto">
                                <Slider
                                    value={hasMinThrot ? [this.state.throttle, this.state.num] : this.state.num}
                                    min={hasMinThrot ? MIN_THROTTLE : Number(this.state.min)}
                                    max={Number(this.state.max)}
                                    marks={marks}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(x) => {
                                        if (x === this.state.throttle) {
                                            return 'Throttle';
                                        }
                                        return 'Target';
                                    }}
                                    onChange={this.handleSlider}
                                    style={{width: '250px'}}
                                />
                            </Grid>
                            <Grid size="auto">
                                <Box
                                    sx={{
                                        pl: 2,
                                        pb: 3,
                                    }}
                                >
                                    <FormControl>
                                        <Input
                                            value={this.state.num}
                                            onChange={this.handleInputChange}
                                            onBlur={this.handleInputBlur}
                                            endAdornment={<InputAdornment position="end">TH/s</InputAdornment>}
                                            style={{width: 90}}
                                            slotProps={{
                                                input: {
                                                    step: 1,
                                                    min: hasMinThrot ? this.state.throttle : this.state.min,
                                                    max: this.state.max,
                                                    type: 'number',
                                                },
                                            }}
                                        />
                                        <Typography variant="subtitle2" color="textSecondary" component="a">
                                            Target
                                        </Typography>
                                    </FormControl>
                                    {hasMinThrot && (
                                        <FormControl>
                                            <Input
                                                value={this.state.throttle}
                                                onChange={this.handleThrotChange}
                                                onBlur={this.handleThrotBlur}
                                                endAdornment={<InputAdornment position="end">TH/s</InputAdornment>}
                                                style={{width: 90}}
                                                slotProps={{
                                                    input: {step: 1, min: 10, max: this.state.num, type: 'number'},
                                                }}
                                            />
                                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                                Min Throttle
                                                <Tooltip
                                                    title="Minimum throttling hashrate before idling"
                                                    placement="right"
                                                >
                                                    <InfoIcon sx={{fontSize: 14}} />
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
                                                endAdornment={<InputAdornment position="end">TH/s</InputAdornment>}
                                                style={{width: 90}}
                                                slotProps={{
                                                    input: {
                                                        step: 1,
                                                        min: 1,
                                                        max: this.state.num - this.state.throttle,
                                                        type: 'number',
                                                    },
                                                }}
                                            />
                                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                                Throttle Step
                                                <Tooltip title="Amount to step down when throttling" placement="right">
                                                    <InfoIcon sx={{fontSize: 14}} />
                                                </Tooltip>
                                            </Typography>
                                        </FormControl>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

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
