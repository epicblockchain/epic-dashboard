import * as React from 'react';
import {Button, TextField, Select, FormControl, InputLabel, InputAdornment, Switch} from '@mui/material';

export class CoinTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coin: 'Select Coin',
            stratum_configs: [
                {pool: '', address: '', worker: '', password: ''},
                {pool: '', address: '', worker: '', password: ''},
                {pool: '', address: '', worker: '', password: ''},
            ],
            checked: true,
            password: this.props.sessionPass,
        };

        this.updateCoin = this.updateCoin.bind(this);
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

    updatePool(e, i) {
        const temp = this.state.stratum_configs.slice();
        temp[i].pool = e.target.value;
        this.setState({stratum_configs: temp});
    }

    updateAddress(e, i) {
        const temp = this.state.stratum_configs.slice();
        temp[i].address = e.target.value;
        this.setState({stratum_configs: temp});
    }

    updateWorker(e, i) {
        const temp = this.state.stratum_configs.slice();
        temp[i].worker = e.target.value;
        this.setState({stratum_configs: temp});
    }

    updateWalletPass(e, i) {
        const temp = this.state.stratum_configs.slice();
        temp[i].password = e.target.value;
        this.setState({stratum_configs: temp});
    }

    updateCheck(e) {
        this.setState({checked: e.target.checked});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    cloneFields() {
        const temp = [
            {pool: '', address: '', worker: '', password: ''},
            {pool: '', address: '', worker: '', password: ''},
            {pool: '', address: '', worker: '', password: ''},
        ];

        if (this.props.selected.length && this.props.data[this.props.selected[0]].sum) {
            if (this.props.data[this.props.selected[0]].sum.StratumConfigs) {
                this.props.data[this.props.selected[0]].sum.StratumConfigs.forEach((config, i) => {
                    const arr = config.login.split('.');
                    temp[i] = {
                        pool: config.pool,
                        address: arr[0] || '',
                        worker: arr[1] ? arr[1].split('-')[0] : '',
                        password: config.password,
                    };
                });
                this.setState({
                    coin: this.props.data[this.props.selected[0]].sum.Mining['Coin'],
                    stratum_configs: temp,
                });
            } else if (this.props.data[this.props.selected[0]].sum.Stratum) {
                const arr = this.props.data[this.props.selected[0]].sum.Stratum['Current User'].split('.');
                temp[0] = {
                    pool: this.props.data[this.props.selected[0]].sum.Stratum['Current Pool'],
                    address: arr[0] || '',
                    worker: arr[1] ? arr[1].split('-')[0] : '',
                    password: '',
                };
                this.setState({
                    coin: this.props.data[this.props.selected[0]].sum.Mining['Coin'],
                    stratum_configs: temp,
                });
            }
        } else {
            this.setState({stratum_configs: temp});
        }
    }

    clearFields() {
        this.setState({
            coin: 'Select Coin',
            stratum_configs: [
                {pool: '', address: '', worker: '', password: ''},
                {pool: '', address: '', worker: '', password: ''},
                {pool: '', address: '', worker: '', password: ''},
            ],
        });
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
            !this.state.stratum_configs[0].pool ||
            !this.state.stratum_configs[0].address ||
            !this.state.stratum_configs[0].worker ||
            !this.state.password ||
            !this.props.selected.length;

        return (
            <div className="tab-body">
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="coin">Coin</InputLabel>
                    <Select
                        native
                        id="coin"
                        label="Coin"
                        size="small"
                        value={this.state.coin}
                        onChange={this.updateCoin}
                    >
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
                <Button onClick={() => this.clearFields()} variant="contained" className="float stop">
                    Clear fields
                </Button>
                <Button
                    onClick={() => this.cloneFields()}
                    variant="contained"
                    className="float"
                    color="primary"
                    disabled={!this.props.selected.length}
                >
                    Copy miner settings
                </Button>
                <div className="flex-line">
                    <TextField
                        variant="outlined"
                        label="Mining Pool"
                        onChange={(e) => this.updatePool(e, 0)}
                        className="pool"
                        value={this.state.stratum_configs[0].pool}
                        margin="dense"
                        disabled={this.props.disabled}
                        InputProps={{startAdornment: <InputAdornment>stratum+tcp://</InputAdornment>}}
                    />
                    <TextField
                        variant="outlined"
                        label="Wallet Address/Pool Username"
                        onChange={(e) => this.updateAddress(e, 0)}
                        value={this.state.stratum_configs[0].address}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="wallet"
                    />
                    <p className="period">.</p>
                    <TextField
                        variant="outlined"
                        label="Worker Name"
                        onChange={(e) => this.updateWorker(e, 0)}
                        value={this.state.stratum_configs[0].worker}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="worker"
                    />
                    <TextField
                        variant="outlined"
                        label="Stratum Password"
                        onChange={(e) => this.updateWalletPass(e, 0)}
                        value={this.state.stratum_configs[0].password}
                        margin="dense"
                        className="stratum"
                    />
                </div>
                <div className="flex-line">
                    <TextField
                        variant="outlined"
                        label="Mining Pool"
                        onChange={(e) => this.updatePool(e, 1)}
                        className="pool"
                        value={this.state.stratum_configs[1].pool}
                        margin="dense"
                        disabled={this.props.disabled}
                        InputProps={{startAdornment: <InputAdornment>stratum+tcp://</InputAdornment>}}
                    />
                    <TextField
                        variant="outlined"
                        label="Wallet Address/Pool Username"
                        onChange={(e) => this.updateAddress(e, 1)}
                        value={this.state.stratum_configs[1].address}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="wallet"
                    />
                    <p className="period">.</p>
                    <TextField
                        variant="outlined"
                        label="Worker Name"
                        onChange={(e) => this.updateWorker(e, 1)}
                        value={this.state.stratum_configs[1].worker}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="worker"
                    />
                    <TextField
                        variant="outlined"
                        label="Stratum Password"
                        onChange={(e) => this.updateWalletPass(e, 1)}
                        value={this.state.stratum_configs[1].password}
                        margin="dense"
                        className="stratum"
                    />
                </div>
                <div className="flex-line">
                    <TextField
                        variant="outlined"
                        label="Mining Pool"
                        onChange={(e) => this.updatePool(e, 2)}
                        className="pool"
                        value={this.state.stratum_configs[2].pool}
                        margin="dense"
                        disabled={this.props.disabled}
                        InputProps={{startAdornment: <InputAdornment>stratum+tcp://</InputAdornment>}}
                    />
                    <TextField
                        variant="outlined"
                        label="Wallet Address/Pool Username"
                        onChange={(e) => this.updateAddress(e, 2)}
                        value={this.state.stratum_configs[2].address}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="wallet"
                    />
                    <p className="period">.</p>
                    <TextField
                        variant="outlined"
                        label="Worker Name"
                        onChange={(e) => this.updateWorker(e, 2)}
                        value={this.state.stratum_configs[2].worker}
                        margin="dense"
                        disabled={this.props.disabled}
                        className="worker"
                    />
                    <TextField
                        variant="outlined"
                        label="Stratum Password"
                        onChange={(e) => this.updateWalletPass(e, 2)}
                        value={this.state.stratum_configs[2].password}
                        margin="dense"
                        className="stratum"
                    />
                </div>
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
                    error={!this.state.password}
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
        );
    }
}
