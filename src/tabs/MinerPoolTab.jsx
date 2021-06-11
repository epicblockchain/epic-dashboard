import * as React from 'react';
import { Button, TextField, InputAdornment } from '@material-ui/core';

export class MinerPoolTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {pool: '', password: this.props.sessionPass};

        this.updatePool = this.updatePool.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selected != this.props.selected) {
            if (this.props.selected.length && this.props.data[this.props.selected[0]].sum) {
                if (prevProps.selected[0] != this.props.selected[0] && this.props.data[this.props.selected[0]].sum.Stratum)
                    this.setState({pool: this.props.data[this.props.selected[0]].sum.Stratum['Current Pool']});
            } else {
                this.setState({pool: ''});        
            }
        }
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }
    
    updatePool(e) {
        this.setState({pool: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="Mining Pool" onChange={this.updatePool}
                    value={this.state.pool} margin="dense" className="pool"
                    InputProps={{startAdornment: <InputAdornment>stratum+tcp://</InputAdornment>}}
                />
                <TextField value={this.state.password || ''} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <br />
                <Button onClick={() => {
                        this.props.handleApi('/pool', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.pool || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}