import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class PowerTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {power: 1000, password: this.props.sessionPass};

        this.updatePower = this.updatePower.bind(this);
        this.updatePowerBlur =this.updatePowerBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }
    
    updatePower(e) {
        this.setState({power: parseInt(e.target.value) || ''});
    }

    updatePowerBlur(e) {
        let power = this.state.power % 100 > 0 ? Math.round(this.state.power / 100) * 100 : this.state.power;
        power = Math.max(500, Math.min(1300, power));
        this.setState({power: power});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }
    
    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="Set Power" type="number" onChange={this.updatePower} onBlur={this.updatePowerBlur}
                    value={this.state.power} helperText=" Multiple of 100 (watts)" margin="dense"
                    inputProps={{step: "100", min: "500", max: "1300"}}
                />
                <TextField value={this.state.password || ''} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense" onKeyPress= {(e) => {
                    if (e.key === 'Enter') {
                        this.props.handleApi('/hwconfig', this.state, this.props.selected);
                    }
                }}/>
                <Button onClick={() => {
                        this.props.handleApi('/power', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.power || !this.state.password || !this.props.selected.length}
                >
                    Change Power
                </Button>
            </div>
        );
    }
}