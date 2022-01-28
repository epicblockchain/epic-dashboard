import * as React from 'react';
import {Button, TextField, FormControl, InputLabel, Select} from '@material-ui/core';

export class PerformanceTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mode: 'Normal', power: '', password: this.props.sessionPass};

        this.updateMode = this.updateMode.bind(this);
        this.updatePower = this.updatePower.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateMode(e) {
        this.setState({mode: e.target.value});
    }

    updatePower(e) {
        this.setState({power: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let options = null;
        let power = null;

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                if (!options) {
                    options = this.props.data[selected].cap.Presets;
                    power = this.props.data[selected].cap.PresetsPowerLevels;
                    continue;
                }
                for (const option of options) {
                    if (!this.props.data[selected].cap.Presets.includes(option)) {
                        options.splice(options.indexOf(option), 1);
                    }
                }
                if (!this.props.data[selected].cap.PresetPowerLevels) {
                    power = null;
                }
            } else {
                break;
            }
        }
        if (!options) options = ['Normal', 'Efficiency'];
        power = power ? power[this.state.mode] : ['N/A'];

        const disabled = !this.state.mode || !this.state.password || !this.props.selected.length;

        return (
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="mode">Mode</InputLabel>
                    <Select native id="mode" label="Mode" value={this.state.mode} onChange={this.updateMode}>
                        {options.map((a, i) => {
                            return (
                                <option key={i} value={a}>
                                    {a}
                                </option>
                            );
                        })}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="power">Power</InputLabel>
                    <Select native id="power" label="Power" value={this.state.power} onChange={this.updatePower}>
                        {power.map((a, i) => {
                            return (
                                <option key={i} value={a}>
                                    {a}
                                    {a !== 'N/A' ? 'W' : null}
                                </option>
                            );
                        })}
                    </Select>
                </FormControl>
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
                                this.props.handleApi('/mode', this.state, this.props.selected);
                            }
                        }}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/mode', this.state, this.props.selected);
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
