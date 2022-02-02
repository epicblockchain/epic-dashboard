import * as React from 'react';
import {Button, TextField, FormControl, InputLabel, Select} from '@material-ui/core';

export class PerformanceTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mode: 'Select Preset', power: '', password: this.props.sessionPass};

        this.updatePreset = this.updatePreset.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updatePreset(e) {
        let obj = JSON.parse(e.target.value);
        this.setState({mode: obj.mode, power: obj.power});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let powers = null;
        let oldPresets = null;

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                if (this.props.data[selected].cap.PresetsPowerLevels) {
                    if (!powers) {
                        powers = this.props.data[selected].cap.PresetsPowerLevels;
                        continue;
                    }

                    for (const power of Object.keys(powers)) {
                        if (!this.props.data[selected].cap.PresetsPowerLevels[power]) {
                            powers[power] = null;
                        }
                    }
                } else {
                    oldPresets = this.props.data[selected].cap.Presets;
                    powers = null;
                    break;
                }
            } else {
                break;
            }
        }

        const powerArray = [{mode: 'Select Preset'}];
        if (powers)
            powerArray.push(
                ...Object.entries(powers)
                    .map((entry) => entry[1].map((power) => ({mode: entry[0], power: power})))
                    .flat()
            );
        else if (oldPresets) powerArray.push(...oldPresets.map((preset) => ({mode: preset})));

        const disabled = this.state.mode === 'Select Preset' || !this.state.password || !this.props.selected.length;

        return (
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="preset">Preset</InputLabel>
                    <Select
                        native
                        id="preset"
                        label="Preset"
                        value={JSON.stringify({mode: this.state.mode, power: this.state.power})}
                        onChange={this.updatePreset}
                    >
                        {powerArray
                            .sort((a, b) => b.power - a.power)
                            .map((obj, i) => {
                                return obj.mode === 'Select Preset' || obj.power % 100 === 0 || !obj.power ? (
                                    <option key={i} value={JSON.stringify({mode: obj.mode, power: obj.power})}>
                                        {obj.mode} {obj.power ? `@ ${obj.power}W` : ''}
                                    </option>
                                ) : null;
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
