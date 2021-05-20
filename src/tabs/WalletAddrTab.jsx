import * as React from 'react';
import { Button, TextField } from '@material-ui/core';

export class WalletAddrTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {address: '', worker: '', wallet_pass: 'x', password: ''};

        this.updateAddress = this.updateAddress.bind(this);
        this.updateWorker = this.updateWorker.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selected != this.props.selected) {
            if (this.props.selected.length && this.props.data[this.props.selected[0]].sum) {
                if(!prevProps.selected.length) {
                    var arr = this.props.data[this.props.selected[0]].sum.Stratum['Current User'].split('.');
                    this.setState({address: arr[0], worker: arr[1]});
                }
            } else {
                this.setState({address: '', worker: ''});
            }
        }
    }
    
    updateAddress(e) {
        this.setState({address: e.target.value});
    }

    updateWorker(e) {
        this.setState({worker: e.target.value});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="Wallet Address" onChange={this.updateAddress}
                    value={this.state.address}
                />
                .
                <TextField variant="outlined" label="Worker Name" onChange={this.updateWorker}
                    value={this.state.worker}
                />
                <TextField variant="outlined" label="Password" type="password" onChange={this.updatePassword}/>
                <Button onClick={() => {
                        this.props.handleApi('/login', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.address || !this.state.worker || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}