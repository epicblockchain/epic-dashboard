const { dialog } = require('@electron/remote');
const got = require('got');
const fs = require('fs');
import * as React from 'react';
import { Button, FormControl, InputLabel, Select } from '@material-ui/core';

export class DebugTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = { test: 'Ft3Seq', type: 'Sphinx', password: 'welcome' };

        this.updateTest = this.updateTest.bind(this);
        this.updateType = this.updateType.bind(this);
        this.saveLogs = this.saveLogs.bind(this);
    }

    updateTest(e) {
        this.setState({ test: e.target.value });
    }

    updateType(e) {
        this.setState({ type: e.target.value });
    }

    saveLogs(test) {
        dialog
            .showOpenDialog({
                properties: ['openDirectory', 'createDirectory'],
            })
            .then(async (arg) => {
                if (!arg.canceled) {
                    for (const i of this.props.selected) {
                        let ip = this.props.data[i].ip;
                        let data = await got(`http://${ip}/${test}.log`);

                        fs.writeFile(arg.filePaths[0] + `/${test}-${ip}.log`, data.body, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                        this.props.notify('success', `Logs written to  ${arg.filePaths[0]}`);
                    }
                }
            })
            .catch((err) => {
                this.props.notify('error', String(err));
                console.log(err);
            });
    }

    render() {
        let options = null;

        for (const selected of this.props.selected) {
            if (this.props.data[selected].cap && this.props.data[selected].cap.TestModes) {
                if (!options) {
                    options = this.props.data[selected].cap.TestModes;
                    continue;
                }
                for (const option of options) {
                    if (!this.props.data[selected].cap.TestModes.includes(option)) {
                        options.splice(options.indexOf(option), 1);
                    }
                }
            } else {
                break;
            }
        }
        if (!options) options = ['Select miners'];
        let types = ['Sphinx', 'Ra'];

        return (
            <div style={{ padding: '12px 0' }}>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="test">Test</InputLabel>
                    <Select native id="test" label="Test" value={this.state.test} onChange={this.updateTest}>
                        {options.map((a, i) => {
                            return (
                                <option key={i} value={a}>
                                    {a}
                                </option>
                            );
                        })}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" margin="dense">
                    <InputLabel htmlFor="type">Type</InputLabel>
                    <Select native id="type" label="Type" value={this.state.type} onChange={this.updateType}>
                        {types.map((a, i) => {
                            return (
                                <option key={i} value={a}>
                                    {a}
                                </option>
                            );
                        })}
                    </Select>
                </FormControl>
                <Button
                    onClick={() => {
                        this.props.handleApi('/test', this.state, this.props.selected);
                    }}
                    variant="contained"
                    color="primary"
                    disabled={this.props.disabled || !this.props.selected.length}
                >
                    Start Test
                </Button>
                <br />
                <Button
                    onClick={() => {
                        for (const i of this.props.selected) {
                            let ip = this.props.data[i].ip;
                            window.open(`http://${ip}/FT3.log`, `FT3 Log for ${ip}`, `popup=1,width=1000,height=600`);
                        }
                    }}
                    variant="contained"
                    color="secondary"
                    disabled={!this.props.selected.length}
                >
                    View FT3 Logs
                </Button>
                <Button
                    onClick={() => this.saveLogs('FT3')}
                    variant="contained"
                    color="primary"
                    disabled={!this.props.selected.length}
                >
                    Save FT3 Logs
                </Button>
                <Button
                    onClick={() => {
                        for (const i of this.props.selected) {
                            let ip = this.props.data[i].ip;
                            window.open(`http://${ip}/FT4.log`, `FT4 Log for ${ip}`, `popup=1,width=1000,height=600`);
                        }
                    }}
                    variant="contained"
                    color="secondary"
                    disabled={!this.props.selected.length}
                >
                    View FT4 Logs
                </Button>
                <Button
                    onClick={() => this.saveLogs('FT4')}
                    variant="contained"
                    color="primary"
                    disabled={!this.props.selected.length}
                >
                    Save FT4 Logs
                </Button>
            </div>
        );
    }
}
