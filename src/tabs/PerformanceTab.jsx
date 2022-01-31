import * as React from 'react';
import {Button, TextField, FormControl, InputLabel, Select} from '@material-ui/core';

export class PerformanceTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mode: 'Normal', power: '', password: this.props.sessionPass};

        this.updatePreset = this.updatePreset.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updatePreset(e, oldApi) {
        let obj = JSON.parse(e.target.value);
        this.setState({mode: obj.mode, power: oldApi ? '' : obj.power}, () => console.log(this.state));
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let powers = null;
        let oldApi = true;

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                if (this.props.data[selected].cap.PresetsPowerLevels) {
                    oldApi = false;

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
                    powers = null;
                    break;
                }
            } else {
                break;
            }
        }

        if (!powers) powers = {Normal: [1300], Efficiency: [900], UltraEfficiency: [500]};
        const value = JSON.stringify({
            mode: this.state.mode,
            power: !oldApi ? this.state.power : powers[this.state.mode][0],
        });

        const disabled = !this.state.mode || !this.state.password || !this.props.selected.length;

        return (
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="preset">Preset</InputLabel>
                    <Select
                        native
                        id="preset"
                        label="Preset"
                        value={value}
                        onChange={(e) => this.updatePreset(e, oldApi)}
                    >
                        {Object.keys(powers).map((mode) => {
                            return powers[mode].map((power, i) => {
                                return (
                                    <option key={i} value={JSON.stringify({mode: mode, power: power})}>
                                        {mode} @ {power}W
                                    </option>
                                );
                            });
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
