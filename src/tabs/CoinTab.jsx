import * as React from 'react';
import { Button, TextField, Select, FormControl, FormControlLabel, InputLabel } from '@material-ui/core';

export class CoinTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {coin: '', pool: '', address: '', worker: '', wallet_pass: 'x', password: ''};

        this.updateCoin = this.updateCoin.bind(this);
        this.updatePool = this.updatePool.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.updateWorker = this.updateWorker.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selected != this.props.selected) {
            if (this.props.selected.length && this.props.data[this.props.selected[0]].sum) {
                if(!prevProps.selected.length) {
                    var arr = this.props.data[this.props.selected[0]].sum.Stratum['Current User'].split('.');
                    this.setState({
                        coin: this.props.data[this.props.selected[0]].sum.Mining['Coin'],
                        pool: this.props.data[this.props.selected[0]].sum.Stratum['Current Pool'],
                        address: arr[0],
                        worker: arr[1]
                    });
                }
            } else {
                this.setState({pool: '', address: '', worker: ''});
            }
        }
    }

    updateCoin(e) {
        this.setState({coin: e.target.value});
    }

    updatePool(e) {
        this.setState({pool: e.target.value});
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
        let options;
        if (this.props.list == 0) {
            options = ['Sia'];
        } else {
            options = ['Smartcash', 'Zenprotocol', 'Etc', 'Qitmeer'];
        }

        return(
            <div style={{padding: '12px 0'}}>
                <FormControl variant="outlined">
                    <InputLabel htmlFor="coin">Coin</InputLabel>
                    <Select native id="coin" label="Coin" value={this.state.coin} onChange={this.updateCoin}>
                        {
                            options.map((a, i) => {
                                return <option key={i} value={a}>{a}</option>;
                            })
                        }
                    </Select>
                </FormControl>
                <FormControlLabel control={
                    <TextField variant="outlined" label="Mining Pool" onChange={this.updatePool}
                        value={this.state.pool}
                    />
                } label="stratum+tcp://" labelPlacement="start"/>
                
                <br />
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