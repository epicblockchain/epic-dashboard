import {
    Button,
    FormControl,
    InputLabel,
    Select,
    Switch,
    TextField,
    MenuItem,
    Typography,
    IconButton,
    Input,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/ControlPoint';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';

const MAX_HASHRATE_SPLITS = 3;

// Reusable pool configuration component
const PoolConfigFields = ({
    pool,
    address,
    worker,
    password,
    index,
    onPoolChange,
    onAddressChange,
    onWorkerChange,
    onPasswordChange,
    disabled,
}) => (
    <div className="flex-line">
        <TextField
            variant="outlined"
            label="Mining Pool"
            onChange={onPoolChange}
            className="pool"
            value={pool}
            margin="dense"
            disabled={disabled}
        />
        <TextField
            variant="outlined"
            label="Wallet Address/Pool Username"
            onChange={onAddressChange}
            value={address}
            margin="dense"
            disabled={disabled}
            className="wallet"
        />
        <p className="period">.</p>
        <TextField
            variant="outlined"
            label="Worker Name"
            onChange={onWorkerChange}
            value={worker}
            margin="dense"
            disabled={disabled}
            className="worker"
        />
        <TextField
            variant="outlined"
            label="Stratum Password"
            onChange={onPasswordChange}
            value={password}
            margin="dense"
            disabled={disabled}
            className="stratum"
        />
    </div>
);

export class CoinTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coin: 'Select Coin',
            unique_variant: '',
            stratum_configs: [
                {pool: '', address: '', worker: '', password: ''},
                {pool: '', address: '', worker: '', password: ''},
                {pool: '', address: '', worker: '', password: ''},
            ],
            checked: true,
            hashrate_split_enabled: false,
            hashrate_splits: [
                {
                    coin: 'Select Coin',
                    stratum_configs: [
                        {pool: '', address: '', worker: '', password: ''},
                        {pool: '', address: '', worker: '', password: ''},
                        {pool: '', address: '', worker: '', password: ''},
                    ],
                    ratio: 100,
                    unique_variant: '',
                },
            ],
            password: this.props.sessionPass,
        };

        this.updateCoin = this.updateCoin.bind(this);
        this.updateVariant = this.updateVariant.bind(this);
        this.updateCheck = this.updateCheck.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updateHashrateSplitEnabled = this.updateHashrateSplitEnabled.bind(this);
        this.addHashrateSplit = this.addHashrateSplit.bind(this);
        this.removeHashrateSplit = this.removeHashrateSplit.bind(this);
        this.handleApplySettings = this.handleApplySettings.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updateCoin(e) {
        this.setState({coin: e.target.value});
    }

    updateVariant(e) {
        this.setState({unique_variant: e.target.value});
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

    updateHashrateSplitEnabled(e) {
        const enabled = e.target.checked;
        if (enabled) {
            // When enabling hashrate split, initialize Pool Config 1 with current settings
            const initialSplit = {
                coin: this.state.coin,
                stratum_configs: [
                    {...this.state.stratum_configs[0]},
                    {...this.state.stratum_configs[1]},
                    {...this.state.stratum_configs[2]},
                ],
                ratio: 100,
                unique_variant: this.state.unique_variant,
            };
            this.setState({
                hashrate_split_enabled: enabled,
                hashrate_splits: [initialSplit],
            });
        } else {
            this.setState({hashrate_split_enabled: enabled});
        }
    }

    async handleApplySettings() {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        let valid = false;
        if (this.state.hashrate_split_enabled) {
            valid = await this.props.handleApi('/hashratesplit', this.state, this.props.selected);
        } else {
            valid = await this.props.handleApi('/coin', this.state, this.props.selected);
            await sleep(1000);
            if (this.state.checked) {
                const idValid = await this.props.handleApi('/id/variant', this.state, this.props.selected);
                valid = valid ?? idValid;
            }
        }
        await sleep(1000);
        if (valid) {
            await this.props.handleApi('/hashratesplit/enable', this.state, this.props.selected);
        }
    }

    addHashrateSplit() {
        if (this.state.hashrate_splits.length < MAX_HASHRATE_SPLITS) {
            // Create empty pool config for subsequent splits
            const newSplit = {
                coin: 'Select Coin',
                stratum_configs: [
                    {pool: '', address: '', worker: '', password: ''},
                    {pool: '', address: '', worker: '', password: ''},
                    {pool: '', address: '', worker: '', password: ''},
                ],
                ratio: 0,
                unique_variant: '',
            };
            this.setState({
                hashrate_splits: [...this.state.hashrate_splits, newSplit],
            });
        }
    }

    removeHashrateSplit(index) {
        if (this.state.hashrate_splits.length > 1) {
            const temp = this.state.hashrate_splits.slice();
            temp.splice(index, 1);
            this.setState({hashrate_splits: temp});
        }
    }

    updateSplitCoin(e, splitIndex) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].coin = e.target.value;
        this.setState({hashrate_splits: temp});
    }

    updateSplitVariant(e, splitIndex) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].unique_variant = e.target.value;
        this.setState({hashrate_splits: temp});
    }

    updateSplitPool(e, splitIndex, configIndex) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].stratum_configs[configIndex].pool = e.target.value;
        this.setState({hashrate_splits: temp});
    }

    updateSplitAddress(e, splitIndex, configIndex) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].stratum_configs[configIndex].address = e.target.value;
        this.setState({hashrate_splits: temp});
    }

    updateSplitWorker(e, splitIndex, configIndex) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].stratum_configs[configIndex].worker = e.target.value;
        this.setState({hashrate_splits: temp});
    }

    updateSplitPassword(e, splitIndex, configIndex) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].stratum_configs[configIndex].password = e.target.value;
        this.setState({hashrate_splits: temp});
    }

    updateSplitRatio(splitIndex, newValue) {
        const temp = this.state.hashrate_splits.slice();
        temp[splitIndex].ratio = newValue;
        this.setState({hashrate_splits: temp});
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
            if (this.props.data[this.props.selected[0]].sum.Stratum) {
                this.setState({
                    unique_variant: this.props.data[this.props.selected[0]].sum.Stratum['Worker Unique Id Variant'],
                });
                this.setState({
                    checked: this.props.data[this.props.selected[0]].sum.Stratum['Worker Unique Id'],
                });
            }
        } else {
            this.setState({stratum_configs: temp});
        }
    }

    clearFields() {
        if (this.state.hashrate_split_enabled) {
            // Clear all fields in all hashrate split groups but keep the groups
            const clearedSplits = this.state.hashrate_splits.map((split) => ({
                coin: 'Select Coin',
                stratum_configs: [
                    {pool: '', address: '', worker: '', password: ''},
                    {pool: '', address: '', worker: '', password: ''},
                    {pool: '', address: '', worker: '', password: ''},
                ],
                ratio: 0, // Clear the ratio too
                unique_variant: '',
            }));
            this.setState({hashrate_splits: clearedSplits});
        } else {
            this.setState({
                coin: 'Select Coin',
                unique_variant: '',
                stratum_configs: [
                    {pool: '', address: '', worker: '', password: ''},
                    {pool: '', address: '', worker: '', password: ''},
                    {pool: '', address: '', worker: '', password: ''},
                ],
            });
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
            !this.state.stratum_configs[0].pool ||
            !this.state.stratum_configs[0].address ||
            !this.state.stratum_configs[0].worker ||
            !this.state.password ||
            !this.props.selected.length;

        const hashrateSplitDisabled =
            !this.state.password ||
            !this.props.selected.length ||
            this.state.hashrate_splits.some(
                (split) =>
                    split.coin === 'Select Coin' ||
                    !split.stratum_configs[0].pool ||
                    !split.stratum_configs[0].address ||
                    !split.stratum_configs[0].worker
            );

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
                        disabled={this.state.hashrate_split_enabled}
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
                        disabled={this.state.hashrate_split_enabled}
                    />
                </FormControl>
                <FormControl
                    variant="outlined"
                    margin="dense"
                    style={{width: '200px'}}
                    disabled={!this.state.checked || this.state.hashrate_split_enabled}
                >
                    <InputLabel>Unique ID Variant</InputLabel>
                    <Select
                        id="variant"
                        label="Unique ID Variant"
                        size="small"
                        value={this.state.unique_variant}
                        onChange={this.updateVariant}
                    >
                        <MenuItem value={'IpAddress'}>Ip Address</MenuItem>
                        <MenuItem value={'MacAddress'}>Mac Address</MenuItem>
                        <MenuItem value={'CpuId'}>CPU ID</MenuItem>
                    </Select>
                </FormControl>
                <FormControl margin="dense" style={{height: '40px', marginLeft: '20px'}}>
                    <div className="unique-id-label">Hashrate Split</div>
                    <Switch
                        color="primary"
                        className="unique-id"
                        checked={this.state.hashrate_split_enabled}
                        onChange={this.updateHashrateSplitEnabled}
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

                {!this.state.hashrate_split_enabled ? (
                    <>
                        {[0, 1, 2].map((i) => (
                            <PoolConfigFields
                                key={i}
                                pool={this.state.stratum_configs[i].pool}
                                address={this.state.stratum_configs[i].address}
                                worker={this.state.stratum_configs[i].worker}
                                password={this.state.stratum_configs[i].password}
                                index={i}
                                onPoolChange={(e) => this.updatePool(e, i)}
                                onAddressChange={(e) => this.updateAddress(e, i)}
                                onWorkerChange={(e) => this.updateWorker(e, i)}
                                onPasswordChange={(e) => this.updateWalletPass(e, i)}
                                disabled={this.props.disabled}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {this.state.hashrate_splits.map((split, splitIndex) => (
                            <div
                                key={splitIndex}
                                style={{
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    borderRadius: '4px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <Typography variant="h6">Pool Config {splitIndex + 1}</Typography>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <Typography variant="body2" style={{marginRight: '10px'}}>
                                            Ratio: {split.ratio}%
                                        </Typography>
                                        <Input
                                            value={split.ratio}
                                            margin="dense"
                                            onChange={(e) =>
                                                this.updateSplitRatio(
                                                    splitIndex,
                                                    e.target.value === '' ? 0 : Number(e.target.value)
                                                )
                                            }
                                            inputProps={{step: 5, min: 0, max: 100, type: 'number'}}
                                            style={{width: '70px'}}
                                        />
                                        <IconButton
                                            onClick={() => this.removeHashrateSplit(splitIndex)}
                                            disabled={this.state.hashrate_splits.length <= 1}
                                            color="error"
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                    </div>
                                </div>
                                <FormControl variant="outlined" margin="dense" style={{minWidth: '200px'}}>
                                    <InputLabel htmlFor={`coin-${splitIndex}`}>Coin</InputLabel>
                                    <Select
                                        native
                                        id={`coin-${splitIndex}`}
                                        label="Coin"
                                        size="small"
                                        value={split.coin}
                                        onChange={(e) => this.updateSplitCoin(e, splitIndex)}
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
                                <FormControl
                                    variant="outlined"
                                    margin="dense"
                                    style={{width: '200px', marginLeft: '10px'}}
                                >
                                    <InputLabel>Unique ID Variant</InputLabel>
                                    <Select
                                        id={`variant-${splitIndex}`}
                                        label="Unique ID Variant"
                                        size="small"
                                        value={split.unique_variant}
                                        onChange={(e) => this.updateSplitVariant(e, splitIndex)}
                                    >
                                        <MenuItem value={''}>None</MenuItem>
                                        <MenuItem value={'IpAddress'}>Ip Address</MenuItem>
                                        <MenuItem value={'MacAddress'}>Mac Address</MenuItem>
                                        <MenuItem value={'CpuId'}>CPU ID</MenuItem>
                                    </Select>
                                </FormControl>
                                {[0, 1, 2].map((configIndex) => (
                                    <PoolConfigFields
                                        key={configIndex}
                                        pool={split.stratum_configs[configIndex].pool}
                                        address={split.stratum_configs[configIndex].address}
                                        worker={split.stratum_configs[configIndex].worker}
                                        password={split.stratum_configs[configIndex].password}
                                        index={configIndex}
                                        onPoolChange={(e) => this.updateSplitPool(e, splitIndex, configIndex)}
                                        onAddressChange={(e) => this.updateSplitAddress(e, splitIndex, configIndex)}
                                        onWorkerChange={(e) => this.updateSplitWorker(e, splitIndex, configIndex)}
                                        onPasswordChange={(e) => this.updateSplitPassword(e, splitIndex, configIndex)}
                                        disabled={this.props.disabled}
                                    />
                                ))}
                            </div>
                        ))}
                        <IconButton
                            onClick={() => this.addHashrateSplit()}
                            disabled={this.state.hashrate_splits.length >= MAX_HASHRATE_SPLITS}
                            color="primary"
                        >
                            <AddIcon /> Add Group
                        </IconButton>
                    </>
                )}
                <div style={{display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center'}}>
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        onKeyPress={async (e) => {
                            if (
                                e.key === 'Enter' &&
                                !(this.state.hashrate_split_enabled ? hashrateSplitDisabled : disabled)
                            ) {
                                await this.handleApplySettings();
                            }
                        }}
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => this.handleApplySettings()}
                        variant="contained"
                        color="primary"
                        disabled={this.state.hashrate_split_enabled ? hashrateSplitDisabled : disabled}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
