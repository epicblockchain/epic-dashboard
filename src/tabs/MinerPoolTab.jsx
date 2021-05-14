import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class MinerPoolTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {pool: '', password: ''};

        this.updatePool = this.updatePool.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
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
                stratum+tcp://
                <TextField id="ip" variant="outlined" label="Mining Pool" onChange={this.updatePool}/>
                <TextField id="password" variant="outlined" label="Password" onChange={this.updatePassword}/>
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