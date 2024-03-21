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
const MIN_THROTTLE = 10;
export class PerpetualtuneTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            algo: '',
            name: '',
            desc: '',
            num: 0,
            throttle: MIN_THROTTLE,
            min: 0,
            max: 0,
            password: this.props.sessionPass,
        };
        this.updateCheck = this.updateCheck.bind(this);
        this.updateAlgorithm = this.updateAlgorithm.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleThrotChange = this.handleThrotChange.bind(this);
        this.handleThrotBlur = this.handleThrotBlur.bind(this);
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
            let newVal = Math.max(this.state.num, MIN_THROTTLE);
            this.setState({throttle: newVal});
        }
    }

    handleSlider(e, newVal) {
        this.setState({num: Math.max(newVal[1], this.state.min ?? 60), throttle: newVal[0]});
    }

    handleInputChange(e) {
        this.setState({num: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleThrotChange(e) {
        this.setState({throttle: e.target.value == '' ? '' : Number(e.target.value)});
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

        let algo_info = [];
        let marks = [
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
                let perpetualtune_cap = this.props.data[this.props.selected[0]].cap['PerpetualTune'];
                for (let i in perpetualtune_cap) {
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
        if (this.state.algo === 'VoltageOptimizer') hasMinThrot = true;

        return (
            <div className="tab-body" style={{minHeight: '140px'}}>
                <Grid container spacing={2}>
                    <Grid item container spacing={2} alignItems="center" style={{width: '275px'}}>
                        <Box pl={4}>
                            <FormControlLabel
                                control={
                                    <MuiSwitchLarge
                                        color="primary"
                                        checked={this.state.checked}
                                        onChange={this.updateCheck}
                                    />
                                }
                                label={<Box fontSize={20}>Perpetual Tuning</Box>}
                                labelPlacement="top"
                            />
                        </Box>
                    </Grid>
                    <Divider orientation="vertical" sx={{pt: 25}} style={{marginRight: '25px'}} />

                    <FormControl disabled={!this.state.checked}>
                        <Typography fontSize={20}>Perpetual Tune Algorithm</Typography>
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
                                            inputProps={{min: x.min, max: x.max}}
                                        />
                                    }
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <Divider orientation="vertical" sx={{pt: 25}} style={{margin: '0 25px'}} />
                    <Grid item xs hidden={!this.state.checked || algo_info.length == 0 || this.state.algo == ''}>
                        <Typography fontSize={20}>{this.state.name}</Typography>
                        <Typography fontSize={14}>{this.state.desc}</Typography>
                        <br />
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs="auto">
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
                            <Grid item xs={2}>
                                <Box pl={2} pb={3}>
                                    <Input
                                        value={this.state.num}
                                        onChange={this.handleInputChange}
                                        onBlur={this.handleInputBlur}
                                        endAdornment={<InputAdornment position="end">TH/s</InputAdornment>}
                                        inputProps={{
                                            step: 1,
                                            min: hasMinThrot ? this.state.throttle : this.state.min,
                                            max: this.state.max,
                                            type: 'number',
                                        }}
                                        style={{width: 90}}
                                    />
                                    <Typography variant="subtitle2" color="textSecondary" component="a">
                                        Target
                                    </Typography>
                                    {hasMinThrot && (
                                        <div>
                                            <Input
                                                value={this.state.throttle}
                                                onChange={this.handleThrotChange}
                                                onBlur={this.handleThrotBlur}
                                                endAdornment={<InputAdornment position="end">TH/s</InputAdornment>}
                                                inputProps={{step: 1, min: 10, max: this.state.num, type: 'number'}}
                                                style={{width: 90}}
                                            />
                                            <Typography
                                                variant="subtitle2"
                                                color="textSecondary"
                                                gutterBottom
                                                style={{width: 120}}
                                            >
                                                Min Throttle
                                                <Tooltip
                                                    title="Minimum throttling hashrate before idling"
                                                    placement="right"
                                                >
                                                    <InfoIcon sx={{fontSize: 14}} />
                                                </Tooltip>
                                            </Typography>
                                        </div>
                                    )}
                                </Box>
                            </Grid>
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
                                this.props.handleApi('/perpetualtune', this.state, this.props.selected);
                                if (this.state.checked) {
                                    this.props.handleApi('/perpetualtune/algo', this.state, this.props.selected);
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
                            }
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
