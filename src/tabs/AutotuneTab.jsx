import * as React from 'react';
import {styled} from '@mui/material/styles';
import {Box, Button, TextField, Slider, Input, Switch, Typography, Grid, Divider} from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export class AutotuneTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            algo: '',
            name: '',
            desc: '',
            num: 0,
            min: 0,
            max: 0,
            password: this.props.sessionPass,
        };
        this.updateCheck = this.updateCheck.bind(this);
        this.updateAlgorithm = this.updateAlgorithm.bind(this);
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

    handleSlider(e, newVal) {
        this.setState({num: newVal});
    }

    handleInputChange(e) {
        this.setState({num: e.target.value == '' ? '' : Number(e.target.value)});
    }

    handleInputBlur() {
        if (this.state.num < this.state.min) this.setState({num: this.state.min});
        else if (this.state.num > this.state.max) this.setState({num: this.state.max});
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
            let autotune_cap = this.props.data[this.props.selected[0]].cap['Autotune'];
            for (let i in autotune_cap) {
                const algo = {
                    algorithm: autotune_cap[i].algorithm,
                    name: autotune_cap[i].name,
                    description: autotune_cap[i].description,
                    min: autotune_cap[i].min,
                    max: autotune_cap[i].max,
                };
                algo_info.push(algo);
            }
        }

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
                                label={<Box fontSize={20}>Enable Autotune</Box>}
                                labelPlacement="top"
                            />
                        </Box>
                    </Grid>
                    <Divider orientation="vertical" sx={{pt: 25}} style={{marginRight: '25px'}} />

                    <FormControl disabled={!this.state.checked}>
                        <Typography fontSize={20}>Autotune Algorithm</Typography>
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
                            <Grid item>
                                <Slider
                                    value={typeof this.state.num === 'number' ? this.state.num : 0}
                                    min={Number(this.state.min)}
                                    max={Number(this.state.max)}
                                    marks={marks}
                                    valueLabelDisplay="auto"
                                    onChange={this.handleSlider}
                                    style={{width: '250px'}}
                                />
                            </Grid>
                            <Grid item>
                                <Box pl={2} pb={3}>
                                    <Input
                                        value={this.state.num}
                                        onChange={this.handleInputChange}
                                        onBlur={this.handleInputBlur}
                                        inputProps={{step: 1, min: this.state.min, max: this.state.max, type: 'number'}}
                                    />
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
                                this.props.handleApi('/autotune', this.state, this.props.selected);
                                if (this.state.checked) {
                                    this.props.handleApi('/autotune/algo', this.state, this.props.selected);
                                }
                            }
                        }}
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/autotune', this.state, this.props.selected);
                            if (this.state.checked) {
                                this.props.handleApi('/autotune/algo', this.state, this.props.selected);
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
