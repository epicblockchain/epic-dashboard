import * as React from 'react';
import FlashOn from '@mui/icons-material/FlashOn';
import Schedule from '@mui/icons-material/Schedule';
import {
    Button,
    TextField,
    Slider,
    Input,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
} from '@mui/material';

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
export class TuneTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            voltage: '',
            clock: '',
            password: this.props.sessionPass,
            preset: 'Select Preset',
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
        this.setState({preset: 'Select Preset'});
    }

    handleInputClockChange(e) {
        this.setState({clock: e.target.value === '' ? '' : Math.round(Number(e.target.value))});
        this.setState({preset: 'Select Preset'});
    }

    handleSliderVoltageChange(e, newVal) {
        this.setState({voltage: newVal});
        this.setState({preset: 'Select Preset'});
    }

    handleInputVoltageChange(e) {
        this.setState({voltage: e.target.value === '' ? '' : Math.round(Number(e.target.value) * 1000) / 1000});
        this.setState({preset: 'Select Preset'});
    }

    handleInputClockBlur() {
        if (this.state.clock < 50) this.setState({clock: 50});
        else if (this.state.clock > 1000) this.setState({clock: 500});
    }

    handleInputVoltageBlur(minV, maxV) {
        if (this.state.voltage < minV) this.setState({voltage: minV});
        else if (this.state.voltage > maxV) this.setState({voltage: maxV});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    handlePresetChange(e) {
        if (e.target.value == 'Select Preset') {
            this.setState({preset: 'Select Preset'});
            return;
        }
        let obj = JSON.parse(e.target.value);
        this.setState({preset: e.target.value});
        this.setState({clock: obj.clk});
        this.setState({voltage: obj.voltage / 1000});
    }

    render() {
        const disabled =
            !this.state.password ||
            !this.props.selected.length ||
            this.props.disabled ||
            !this.state.clock ||
            !this.state.voltage;

        let tunePresets = null;
        let min_v = 12;
        let max_v = 15;
        var marksVOLT = [
            {
                value: min_v,
                label: `${min_v} V`,
            },
            {
                value: max_v,
                label: `${max_v} V`,
            },
        ];

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                min_v = this.props.data[selected]?.cap?.['Psu Info']?.['Min Vout'] / 1000;
                max_v = this.props.data[selected]?.cap?.['Psu Info']?.['Max Vout'] / 1000;

                marksVOLT = [
                    {
                        value: min_v,
                        label: `${min_v} V`,
                    },
                    {
                        value: max_v,
                        label: `${max_v} V`,
                    },
                ];
                if (this.props.data[selected].cap['Tune Presets']) {
                    if (!tunePresets) {
                        tunePresets = Object.assign({}, this.props.data[selected].cap['Tune Presets']);
                        continue;
                    }

                    for (const power of Object.keys(tunePresets)) {
                        if (!this.props.data[selected].cap['Tune Presets'][power]) {
                            tunePresets[power] = null;
                        }
                    }
                } else {
                    (this.state.preset = 'Select Preset'), (tunePresets = null);
                    break;
                }
            } else {
                (this.state.preset = 'Select Preset'), (tunePresets = null);
                break;
            }
        }

        if (this.props.selected.length == 0) {
            this.state.preset = 'Select Preset';
        }

        if (tunePresets != null) {
            for (const power of Object.keys(tunePresets)) {
                if (tunePresets[power] === null) {
                    delete tunePresets[power];
                }
            }
        }

        const powerArray = [];
        if (tunePresets) powerArray.push(...Object.entries(tunePresets).map((entry) => entry[1]));

        return (
            <div className="tab-body" style={{minHeight: '140px'}}>
                <Grid container spacing={2}>
                    <Grid item container spacing={2} style={{width: '450px'}}>
                        <Grid item xs={12}>
                            <Typography gutterBottom>Change Clock or Voltage settings</Typography>
                        </Grid>
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
                                onChange={(e) => this.handleInputClockChange(e)}
                                onBlur={() => this.handleInputClockBlur}
                                inputProps={{step: 5, min: 50, max: 1000, type: 'number'}}
                                style={{width: '70px'}}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <FlashOn />
                        </Grid>
                        <Grid item xs={8}>
                            <Slider
                                value={typeof this.state.voltage === 'number' ? this.state.voltage : min_v}
                                min={min_v}
                                max={max_v}
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
                                onChange={(e) => this.handleInputVoltageChange(e)}
                                onBlur={() => this.handleInputVoltageBlur(min_v, max_v)}
                                inputProps={{step: 0.05, min: min_v, max: max_v, type: 'number'}}
                                style={{width: '70px'}}
                            />
                        </Grid>
                    </Grid>
                    <Divider orientation="vertical" flexItem style={{margin: '0 50px'}} />
                    <Grid item>
                        <Grid item>
                            <Typography style={{margin: '0 0 20px'}}> Tuning Presets for selected miners</Typography>
                        </Grid>
                        <Grid item>
                            <FormControl style={{width: '450px'}}>
                                <InputLabel id="preset-select-label">Presets (Optional)</InputLabel>
                                <Select
                                    labelId="preset-select-label"
                                    label="Presets (Optional)"
                                    onChange={(e) => this.handlePresetChange(e)}
                                    value={this.state.preset}
                                    displayEmpty
                                    fullWidth
                                >
                                    <MenuItem value="Select Preset">
                                        <em>Select Preset</em>
                                    </MenuItem>
                                    {powerArray
                                        .sort((a, b) => a.hashrate - b.hashrate)
                                        .map((obj, i) => {
                                            return (
                                                <MenuItem
                                                    key={i}
                                                    value={JSON.stringify({
                                                        clk: obj.clk,
                                                        voltage: obj.voltage,
                                                        hashrate: obj.hashrate,
                                                        power: obj.power,
                                                    })}
                                                >
                                                    {obj.hashrate ? ` ${obj.hashrate}TH/s` : ''}
                                                    {obj.clk ? ` @ (${obj.clk}MHz` : ''}
                                                    {obj.voltage ? ` : ${obj.voltage / 1000}V)` : ''}
                                                    {obj.power ? ` ~${obj.power}W` : ''}
                                                </MenuItem>
                                            );
                                        })}
                                </Select>
                            </FormControl>
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
