import * as React from 'react';
import {Button, TextField, Select, FormControl, InputLabel, InputAdornment, Switch, FormControlLabel} from '@material-ui/core';

export class CoinTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {coin: '', pool: '', address: '', worker: '', wallet_pass: 'x', checked: true, password: this.props.sessionPass};

        this.updateCoin = this.updateCoin.bind(this);
        this.updatePool = this.updatePool.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.updateWorker = this.updateWorker.bind(this);
        this.updateWalletPass = this.updateWalletPass.bind(this);
        this.updateCheck = this.updateCheck.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.disabled && prevProps.selected != this.props.selected) {
            if (this.props.selected.length && this.props.data[this.props.selected[0]].sum) {
                if (
                    prevProps.selected[0] != this.props.selected[0] &&
                    this.props.data[this.props.selected[0]].sum.Stratum
                ) {
                    var arr = this.props.data[this.props.selected[0]].sum.Stratum['Current User'].split('.');
                    this.setState({
                        coin: this.props.data[this.props.selected[0]].sum.Mining['Coin'],
                        pool: this.props.data[this.props.selected[0]].sum.Stratum['Current Pool'],
                        address: arr[0] || '',
                        worker: arr[1] ? arr[1].split('-')[0] : '',
                    });
                }
            } else {
                this.setState({pool: '', address: '', worker: ''});
            }
        }
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
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

    updateWalletPass(e) {
        this.setState({wallet_pass: e.target.value});
    }

    updateCheck(e) {
        this.setState({checked: e.target.checked});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        let options = null;

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                if (!options) {
                    options = this.props.data[selected].cap.Coins;
                    continue;
                }
                for (const option of options) {
                    if (!this.props.data[selected].cap.Coins.includes(option)) {
                        options.splice(options.indexOf(option), 1);
                    }
                }
            } else {
                break;
            }
        }
        if (!options) options = ['Sia'];

        return (
            <div style={{padding: '12px 0'}}>
                <div className="flex-line">
                    <FormControl variant="outlined" margin="dense">
                        <InputLabel htmlFor="coin">Coin</InputLabel>
                        <Select native id="coin" label="Coin" value={this.state.coin} onChange={this.updateCoin}>
                            {options.map((a, i) => {
                                return (
                                    <option key={i} value={a}>
                                        {a}
                                    </option>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <TextField
                        variant="outlined"
                        label="Mining Pool"
                        onChange={this.updatePool}
                        className="pool"
                        value={this.state.pool}
                        margin="dense"
                        disabled={this.props.disabled}
                        InputProps={{startAdornment: <InputAdornment>stratum+tcp://</InputAdornment>}}
                    />
                    <TextField
                        variant="outlined"
                        label="Wallet Address"
                        onChange={this.updateAddress}
                        value={this.state.address}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="wallet"
                    />
                    <p className="period">.</p>
                    <TextField
                        variant="outlined"
                        label="Worker Name"
                        onChange={this.updateWorker}
                        value={this.state.worker}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="worker"
                    />
                    <TextField
                        variant="outlined"
                        label="Stratum Password"
                        onChange={this.updateWalletPass}
                        value={this.state.wallet_pass}
                        margin="dense"
                        className="stratum"
                    />
                    <FormControl margin="dense" style={{height: '40px'}}>
                        <div className="unique-id-label">Unique ID</div>
                        <Switch color="primary" className="unique-id" checked={this.state.checked} onChange={this.updateCheck} />
                    </FormControl>
                </div>
                <TextField
                    value={this.state.password || ''}
                    variant="outlined"
                    label="Password"
                    type="password"
                    onChange={this.updatePassword}
                    margin="dense"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            this.props.handleApi('/coin', this.state, this.props.selected);
                        }
                    }}
                />
                <Button
                    onClick={() => {
                        this.props.handleApi('/coin', this.state, this.props.selected);
                    }}
                    variant="contained"
                    color="primary"
                    disabled={
                        !this.state.pool ||
                        !this.state.address ||
                        !this.state.wallet_pass ||
                        !this.state.worker ||
                        !this.state.password ||
                        !this.props.selected.length ||
                        this.props.disabled
                    }
                >
                    Apply
                </Button>
            </div>
        );
    }
}
