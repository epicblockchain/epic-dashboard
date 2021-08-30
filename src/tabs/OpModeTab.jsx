import * as React from 'react';
import { Button, TextField, FormControl, InputLabel, Select} from '@material-ui/core';

export class OpModeTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mode: 'normal', password: this.props.sessionPass};

        this.updateMode = this.updateMode.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }
    
    updateMode(e) {
        this.setState({mode: e.target.value.toLowerCase()});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let options = null;

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                if (!options) {
                    options = this.props.data[selected].cap.Presets;
                    continue;
                }
                for (const option of options) {
                    if (!this.props.data[selected].cap.Presets.includes(option)) {
                        options.splice(options.indexOf(option), 1);
                    }
                }
            } else {
                break;
            }
        }
        if (!options) options = ['Normal', 'Efficiency'];

        return(
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="mode">Mode</InputLabel>
                    <Select native id="mode" label="Mode" value={this.state.mode} onChange={this.updateMode}>
                        {
                            options.map((a, i) => {
                                return <option key={i} value={a.toLowerCase()}>{a}</option>;
                            })
                        }
                    </Select>
                </FormControl>
                <TextField value={this.state.password || ''} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/mode', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.mode || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}