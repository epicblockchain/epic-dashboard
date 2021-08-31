const { dialog } = require('@electron/remote');
const got = require('got');
const fs = require('fs');
import * as React from 'react';
import { Button, TextField, Typography, Divider } from '@material-ui/core'; 

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
        dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
        }).then(async arg => {
            if (!arg.canceled){
                for (const i of this.props.selected) {
                    let ip = this.props.data[i].ip;
                    let data = await got(`http://${ip}:4028/log`);
            
                    let body = JSON.parse(data.body);

                    fs.mkdir(arg.filePaths[0] + `/${ip}`, {recursive: true}, (err) => console.log(err));
                    for (let key of Object.keys(body)) {
                        if (body[key]) {
                            fs.writeFile(arg.filePaths[0] + `/${ip}/${ip}_${key}.log`, body[key], function (err) {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                    }

                    this.props.notify('success', `Logs written to  ${arg.filePaths[0]}`);
                }
            }
        }).catch(err => {
            this.props.notify('error', String(err));
            console.log(err);
        });
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField id="ip" variant="outlined" label="Miner IP" onChange={this.updateIP} margin="dense"/>
                <Button onClick={() => this.props.addMiner(this.state.ip)} variant="contained" color="primary"
                    disabled={!this.state.ip}
                >
                    Add Miner via IP
                </Button>
                <Button onClick={() => this.props.saveMiners()} variant="contained" color="secondary">
                    Save Current Miners
                </Button>
                <Button onClick={() => this.props.loadMiners()} variant="contained" color="secondary">
                    Load Saved Miners
                </Button>
                <Divider variant="middle" style={{margin: '8px'}}/>
                <Button
                    onClick={() => {
                        this.props.delMiner(this.props.selected);
                        this.props.select([], this.props.models[this.props.list]);
                    }}
                    variant="contained" color="primary"
                    disabled={!this.props.selected.length}
                >
                    Remove Selected
                </Button>
                <Button
                    onClick={() => {
                        this.props.blacklist(this.props.selected);
                        this.props.select([], this.props.models[this.props.list]);
                    }}
                    variant="contained" color="secondary"
                    disabled={!this.props.selected.length}
                >
                    Blacklist Selected
                </Button>
                <Divider variant="middle" style={{margin: '8px'}}/>
                <Button disableRipple style={{cursor: "default"}}>For Support: </Button>
                <Button onClick={() => this.saveLogs()} variant="contained" color="primary" disabled={!this.props.selected.length}>
                    Save Logs of Selected
                </Button>
            </div>
        );
    }
}