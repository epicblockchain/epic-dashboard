import * as React from 'react';
import { Button, TextField, Select, FormControl, InputLabel } from '@material-ui/core';

export class CmdTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {cmd: 'start', password: this.props.sessionPass};

        this.updateCmd = this.updateCmd.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateCmd(e) {
        this.setState({cmd: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let options = ['autostart', 'stop'];

        return(
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="cmd">Command</InputLabel>
                    <Select native id="cmd" label="Command" value={this.state.cmd} onChange={this.updateCmd}>
                        {
                            options.map((a, i) => {
                                return <option key={i} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>;
                            })
                        }
                    </Select>
                </FormControl>
                <TextField value={this.state.password || ''} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <br />
                <Button onClick={() => {
                        this.props.handleApi('/miner', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.cmd || !this.state.password || !this.props.selected.length}
                >
                    Send
                </Button>
            </div>
        );
    }
}