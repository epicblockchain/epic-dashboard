import React from 'react'
import { Switch, Tab, Tabs } from '@blueprintjs/core'
import { Cell, Column, Table } from '@blueprintjs/table'
import MiningPoolTab from './SettingsTabs/MiningPoolTab'
import WalletAddressTab from './SettingsTabs/WalletAddressTab'
import OperatingModeTab from './SettingsTabs/OperatingModeTab'
import UniqueIDTab from './SettingsTabs/UniqueIDTab'
import FirmwareTab from './SettingsTabs/FirmwareTab'
import PasswordTab from './SettingsTabs/PasswordTab'
import RebootTab from './SettingsTabs/RebootTab'
import HardwareConfigTab from './SettingsTabs/HardwareConfigTab'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/table/lib/css/table.css'
import './SettingsPage.css'

const electron = window.require('electron')

class SettingsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pageState: 'loading',
            swuFilepath: '',
            filePathSelected: false,
            reuseHardwareConfig: true,
            appendUniqueID: true,
            operatingMode: 'normal',
            miners: [],
            ignoreUpdates: {}
        }
        this.settingsGetterHandler = this.settingsGetterHandler.bind(this);
        this.ipCellRenderer = this.ipCellRenderer.bind(this);
        this.nameCellRenderer = this.nameCellRenderer.bind(this);
        this.firmwareVersionCellRenderer = this.firmwareVersionCellRenderer.bind(this);
        this.walletCellRenderer = this.walletCellRenderer.bind(this);
        this.miningPoolCellRenderer = this.miningPoolCellRenderer.bind(this);
        this.applyToCellRenderer = this.applyToCellRenderer.bind(this);

        this.handleApplyToChange = this.handleApplyToChange.bind(this);
        this.handleApplyClicked = this.handleApplyClicked.bind(this);
    }

    ipCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else  {
            return <Cell>{this.state.miners[rowIndex].ip}</Cell>
        }
    }

    nameCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Hostname"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }

    firmwareVersionCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Software"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }

    walletCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Stratum"]["Current User"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }

    miningPoolCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Stratum"]["Current Pool"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }

    handleApplyToChange(e){
        var newApplyTo = [...this.state.applyTo];
        newApplyTo[e.target.value] = e.target.checked;
        this.setState({applyTo: newApplyTo});
    }

    applyToCellRenderer(rowIndex: number){
        const isDisabled = this.state.miners[rowIndex].summary.status !== 'completed';
        return <Cell><Switch value={rowIndex} defaultChecked={false} disabled={isDisabled} onChange={this.handleApplyToChange} /></Cell>
    }

    handleApplyClicked(arg, e){
        arg.state.miners = this.state.miners;
        arg.state.applyTo = this.state.applyTo;
        electron.ipcRenderer.send('post-settings', arg);
    }

    settingsGetterHandler(event, args){
        this.setState({miners: args})
        this.setState({pageState: 'loaded'})
        let newIgnoreUpdates = this.state.ignoreUpdates;
        const applyToArray = args.map((m, i) => {
            if (this.state.ignoreUpdates[m.ip]) {
               return this.state.applyTo[i]; 
            }
            if (m.summary.status === 'completed') {
                newIgnoreUpdates[m.ip] = true;
                return false;
            }
            if (this.state.applyTo) {
                return this.state.applyTo[i]
            } else {
                //miner not loaded case
                return false;
            }
        });
        this.setState({ignoreUpdates: newIgnoreUpdates})
        this.setState({applyTo: applyToArray})
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-settings');
        electron.ipcRenderer.on('get-settings-reply', this.settingsGetterHandler);
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-settings-reply', this.settingsGetterHandler);
    }

    render () {
        return (
            <div className="settingsContainer">
                <div className="settingsTableDiv">
                    <Table enableRowHeader={false} numRows={this.state.miners.length}>
                        <Column name='IP' cellRenderer={this.ipCellRenderer} />
                        <Column name='Firmware Version' cellRenderer={this.firmwareVersionCellRenderer} />
                        <Column name='Miner Name' cellRenderer={this.nameCellRenderer} />
                        <Column name='Mining Pool' cellRenderer={this.miningPoolCellRenderer} />
                        <Column name='Apply To' cellRenderer={this.applyToCellRenderer} />
                    </Table>
                </div>
                <div className="settingsTabsDiv">
                    <Tabs id="SettingsTabs">
                        <Tab id="MiningPoolTab"
                            title="Mining Pool"
                            panel={<MiningPoolTab
                                applyClicked={this.handleApplyClicked}
                                />} />
                        <Tab id="WalletAddressTab"
                             title="Wallet Address"
                             panel={<WalletAddressTab
                                 applyClicked={this.handleApplyClicked}
                            />} />
                        <Tab id="OperatingModeTab"
                             title="Operating Mode" 
                             panel={<OperatingModeTab
                                applyClicked={this.handleApplyClicked}/>} />
                        <Tab id="UniqueIDTab"
                            title="Unique ID"
                            panel={<UniqueIDTab
                                    applyClicked={this.handleApplyClicked}
                                />} />
                        <Tab id="PasswordTab"
                             title="Password"
                             panel={<PasswordTab
                                    applyClicked={this.handleApplyClicked}
                                 />} />
                        <Tab id="FirmwareTab"
                             title="Firmware"
                             panel={<FirmwareTab
                                    applyClicked={this.handleApplyClicked}
                                 />} />
                        <Tab id="RebootTab"
                             title="Reboot"
                             panel={<RebootTab
                                    applyClicked={this.handleApplyClicked}
                                 />} />
                        <Tab id="HWConfigTab"
                            title="Recalibrate"
                            panel={
                                <HardwareConfigTab
                                applyClicked={this.handleApplyClicked}/>
                            }/>
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default SettingsPage;
