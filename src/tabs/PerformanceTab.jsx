import * as React from 'react';
import {Button, TextField, FormControl, InputLabel, Select} from '@mui/material';
import {
    buildPerformancePresetAction,
    getCommonPerformancePresets,
    getPerformancePresetLabel,
} from '../apiCompatibility.mjs';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';

export class PerformanceTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {preset: '', password: this.props.sessionPass};

        this.updatePreset = this.updatePreset.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.applyPreset = this.applyPreset.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
        const previousSelection = Array.isArray(prevProps.selected) ? prevProps.selected : [];
        const currentSelection = Array.isArray(this.props.selected) ? this.props.selected : [];
        if (
            previousSelection.length !== currentSelection.length ||
            previousSelection.some((index, position) => index !== currentSelection[position])
        ) {
            this.setState({preset: ''});
        }
    }

    updatePreset(e) {
        this.setState({preset: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    applyPreset() {
        let preset;
        try {
            preset = JSON.parse(this.state.preset);
        } catch {
            return;
        }

        const action = buildPerformancePresetAction(preset);
        if (!action) return;
        this.props.handleApi(action.api, {...this.state, ...action.data}, this.props.selected);
    }

    render() {
        const capabilities = this.props.selected.map((index) => this.props.data?.[index]?.cap);
        const presets = getCommonPerformancePresets(capabilities);
        const selectedPreset = presets.find((preset) => JSON.stringify(preset) === this.state.preset);
        const disabled = !selectedPreset || !this.state.password || !this.props.selected.length || this.props.disabled;

        return (
            <div className="tab-body settings-tab">
                <TabHeader
                    title="Performance"
                    description="Apply a supported operating or clock and voltage preset to the selected miners."
                />
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="preset">Preset</InputLabel>
                    <Select
                        native
                        id="preset"
                        label="Preset"
                        size="small"
                        value={this.state.preset}
                        onChange={this.updatePreset}
                    >
                        <option value="">Select Preset</option>
                        {[...presets]
                            .sort((a, b) => {
                                if (a.type === 'tune') return (b.hashrate || 0) - (a.hashrate || 0);
                                return (b.power || 0) - (a.power || 0);
                            })
                            .filter((preset) => preset.type !== 'mode' || !preset.power || preset.power % 100 === 0)
                            .map((preset) => (
                                <option key={JSON.stringify(preset)} value={JSON.stringify(preset)}>
                                    {getPerformancePresetLabel(preset)}
                                </option>
                            ))}
                    </Select>
                </FormControl>
                <TabFooter>
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !disabled) this.applyPreset();
                        }}
                        error={!this.state.password}
                    />
                    <Button onClick={this.applyPreset} variant="contained" color="primary" disabled={disabled}>
                        {getMinerActionLabel('Apply', this.props.selected)}
                    </Button>
                </TabFooter>
            </div>
        );
    }
}
