import * as React from 'react';
import {Button, TextField, Select, FormControl, InputLabel, InputAdornment, Switch} from '@material-ui/core';

export class CoinTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coin: 'Select Coin',
            pool: '',
            address: '',
            worker: '',
            wallet_pass: 'x',
            checked: true,
            password: this.props.sessionPass,
        };

        this.updateCoin = this.updateCoin.bind(this);
        this.updatePool = this.updatePool.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.updateWorker = this.updateWorker.bind(this);
        this.updateWalletPass = this.updateWalletPass.bind(this);
        this.updateCheck = this.updateCheck.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
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

    cloneFields() {
        if (this.props.selected.length && this.props.data[this.props.selected[0]].sum) {
            if (this.props.data[this.props.selected[0]].sum.Stratum) {
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

    render() {
        let options = ['Select Coin'];

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap) {
                if (options.length === 1) {
                    options = options.concat(this.props.data[selected].cap.Coins);
                    continue;
                }
                for (const option of options) {
                    if (option !== 'Select Coin' && !this.props.data[selected].cap.Coins.includes(option)) {
                        options.splice(options.indexOf(option), 1);
                    }
                }
            } else {
                break;
            }
        }

        const disabled =
            this.state.coin === 'Select Coin' ||
            !this.state.pool ||
            !this.state.address ||
            !this.state.worker ||
            !this.state.password ||
            !this.props.selected.length;

        return (
            <div style={{padding: '12px 0'}}>
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
                <FormControl margin="dense" style={{height: '40px'}}>
                    <div className="unique-id-label">Unique ID</div>
                    <Switch
                        color="primary"
                        className="unique-id"
                        checked={this.state.checked}
                        onChange={this.updateCheck}
                    />
                </FormControl>
                <Button
                    onClick={() => this.cloneFields()}
                    variant="contained"
                    id="clone"
                    color="primary"
                    disabled={!this.props.selected.length}
                >
                    Clone miner settings
                </Button>
                <div className="flex-line">
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
                        label="Wallet Address/Pool Username"
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
                </div>
                <div className="password-apply">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !disabled) {
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
                        disabled={disabled}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
