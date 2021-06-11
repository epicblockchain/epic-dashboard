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
        this.setState({mode: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let options = [];
        const target = this.props.miners[this.props.models[this.props.list]];
        if (target) options = target[0].cap ? target[0].cap.Presets : ['normal', 'efficiency'];

        return(
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="mode">Mode</InputLabel>
                    <Select native id="mode" label="Mode" value={this.state.mode} onChange={this.updateMode}>
                        {
                            options.map((a, i) => {
                                return <option key={i} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>;
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