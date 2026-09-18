const {ipcRenderer} = require('electron');
import got from '../rendererHttp';
const fs = require('fs');
import * as React from 'react';
import {Button, TextField, Divider} from '@mui/material';
import {TabHeader} from './TabLayout.jsx';

export class AddRemoveTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {ip: ''};

        this.updateIP = this.updateIP.bind(this);
    }

    updateIP(e) {
        this.setState({ip: e.target.value});
    }

    saveLogs(test) {
        ipcRenderer
            .invoke('dialog-open', {
                properties: ['openDirectory', 'createDirectory'],
            })
            .then(async (arg) => {
                if (!arg.canceled) {
                    for (const i of this.props.selected) {
                        const ip = this.props.data[i].ip;
                        const data = await got(`http://${ip}:4028/log`);

                        const body = JSON.parse(data.body);

                        fs.mkdir(arg.filePaths[0] + `/${ip}`, {recursive: true}, (err) => console.log(err));
                        for (const tuple of body) {
                            fs.writeFile(
                                arg.filePaths[0] + `/${ip}/${ip}_${tuple[0].secs_since_epoch}.log`,
                                tuple[1],
                                function (err) {
                                    if (err) {
                                        throw err;
                                    }
                                },
                            );
                        }

                        this.props.notify('success', `${ip}: Logs written to  ${arg.filePaths[0]}`);
                    }
                }
            })
            .catch((err) => {
                this.props.notify('error', String(err));
                console.log(err);
            });
    }

    render() {
        return (
            <div className="tab-body settings-tab">
                <TabHeader title="Miner Management" description="Add, save, load, remove, or export logs for miners." />
                <div className="settings-tab-action-row">
                    <TextField id="ip" variant="outlined" label="Miner IP" onChange={this.updateIP} margin="dense" />
                    <Button
                        onClick={() => this.props.addMiner(this.state.ip)}
                        variant="contained"
                        color="primary"
                        disabled={!this.state.ip}
                    >
                        Add Miner via IP
                    </Button>
                    <Button onClick={() => this.props.saveMiners()} variant="outlined">
                        Save Current Miners
                    </Button>
                    <Button onClick={() => this.props.loadMiners()} variant="outlined">
                        Load Saved Miners
                    </Button>
                </div>
                <Divider />
                <div className="settings-tab-action-row">
                    <Button
                        onClick={() => {
                            this.props.delMiner(this.props.selected);
                            this.props.select([], this.props.models[this.props.list]);
                        }}
                        variant="outlined"
                        color="error"
                        disabled={!this.props.selected.length}
                    >
                        Remove Selected
                    </Button>
                    <Button
                        onClick={() => {
                            this.props.blacklist(this.props.selected);
                            this.props.select([], this.props.models[this.props.list]);
                        }}
                        variant="outlined"
                        color="error"
                        disabled={!this.props.selected.length}
                    >
                        Blacklist Selected
                    </Button>
                </div>
                <Divider />
                <div className="settings-tab-action-row">
                    <Button onClick={() => this.saveLogs()} variant="outlined" disabled={!this.props.selected.length}>
                        Save Logs of Selected
                    </Button>
                </div>
            </div>
        );
    }
}
