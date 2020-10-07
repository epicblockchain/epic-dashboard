import React from 'react'
import { Switch, Tab, Tabs } from '@blueprintjs/core'
import { Cell, Column, Table } from '@blueprintjs/table'
import MiningPoolTab from './SettingsTabs/MiningPoolTab'
import WalletAddressTab from './SettingsTabs/WalletAddressTab'
import OperatingModeTab from './SettingsTabs/OperatingModeTab'
import UniqueIDTab from './SettingsTabs/UniqueIDTab'
import FirmwareTab from './SettingsTabs/FirmwareTab'
import PasswordTab from './SettingsTabs/PasswordTab'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/table/lib/css/table.css'
import './SettingsPage.css'

const electron = window.require('electron')

class SettingsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pageState: 'loading',
            miners: [],
            operatingMode: 'efficiency'
        }
        this.settingsGetterHandler = this.settingsGetterHandler.bind(this);
        this.ipCellRenderer = this.ipCellRenderer.bind(this);
        this.nameCellRenderer = this.nameCellRenderer.bind(this);
        this.walletCellRenderer = this.walletCellRenderer.bind(this);
        this.miningPoolCellRenderer = this.miningPoolCellRenderer.bind(this);
        this.applyToCellRenderer = this.applyToCellRenderer.bind(this);

        this.handleApplyToChange = this.handleApplyToChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleApplyClicked = this.handleApplyClicked.bind(this);
        //miningpool
        this.handleMiningPoolChange = this.handleMiningPoolChange.bind(this);
        //walletaddress
        //operatingmode
        // this.handleOperatingModeChange = this.handleOperatingModeChange.bind(this);
        //uniqueid
        //password
        //firmware
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
        return <Cell><Switch value={rowIndex} defaultChecked={!isDisabled} disabled={isDisabled} onChange={this.handleApplyToChange} /></Cell>
    }

    handleMiningPoolChange(e){
        this.setState({miningPool: e.target.value})
    }

    handlePasswordChange(e){
        this.setState({password: e.target.value})
    }

    handleApplyClicked(arg, e){
        console.log('apply clicked for ' + arg)
    }

    handleOperatingModeChange(e){
        console.log('todo this doesnt work')
        console.log(e.target.value)
        this.setState({operatingMode: e.target.value})
    }

    settingsGetterHandler(event, args){
        this.setState({miners: args})
        this.setState({pageState: 'loaded'})
        const applyToArray = args.map(m => {
            return (m.summary.status === 'completed');
        });
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
                                updateMiningPool={this.handleMiningPoolChange}
                                updatePassword={this.handlePasswordChange}
                                applyClicked={this.handleApplyClicked}
                                />
                            }
                        />
                        <Tab id="WalletAddressTab" title="Wallet Address" panel={<WalletAddressTab
                                change
                            />} />
                        <Tab id="OperatingModeTab" title="Operating Mode" panel={<OperatingModeTab />} />
                        <Tab id="UniqueIDTab" title="Unique ID" panel={<UniqueIDTab />} />
                        <Tab id="PasswordTab" title="Password" panel={<PasswordTab />} />
                        <Tab id="FirmwareTab" title="Firmware" panel={<FirmwareTab />} />
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default SettingsPage;
