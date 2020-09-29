import React from 'react'
import { Checkbox, Tab, Tabs } from '@blueprintjs/core'
import { Cell, Column, Table } from '@blueprintjs/table'
import MiningPoolTab from './SettingsTabs/MiningPoolTab'
import WalletAddressTab from './SettingsTabs/WalletAddressTab'
import OperatingModeTab from './SettingsTabs/OperatingModeTab'
import UniqueIDTab from './SettingsTabs/UniqueIDTab'
import FirmwareTab from './SettingsTabs/FirmwareTab'
import PasswordTab from './SettingsTabs/PasswordTab'
import './SettingsPage.css'

const electron = window.require('electron')

class SettingsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pageState: 'loading',
            miners: []
        }
        this.settingsGetterHandler = this.settingsGetterHandler.bind(this);
        this.ipCellRenderer = this.ipCellRenderer.bind(this);
        this.nameCellRenderer = this.nameCellRenderer.bind(this);
        this.walletCellRenderer = this.walletCellRenderer.bind(this);
        this.applyToCellRenderer = this.applyToCellRenderer.bind(this);
    }

    settingsGetterHandler(event, args){
        this.setState({miners: args})
        this.setState({pageState: 'loaded'})
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-settings');
        electron.ipcRenderer.on('get-settings-reply', this.settingsGetterHandler);
    }

    componentWillUnmount(){
        electron.ipcRenderer.on('get-settings-reply', this.settingsGetterHandler);
    }

    ipCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].ip}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
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

    applyToCellRenderer(rowIndex: number){
        return <Cell><Checkbox defaultChecked={true}/></Cell>
    }

    render () {
        return (
            <div className="settingsContainer">
                <div className="settingsTableDiv">
                    <Table enableRowHeader={false} numRows={this.state.miners.length || 0}>
                        <Column name='IP' cellRenderer={this.ipCellRenderer}/>
                        <Column name='Miner Name' cellRenderer={this.nameCellRenderer}/>
                        <Column name='Miner Name' cellRenderer={this.walletCellRenderer}/>
                        <Column name='Apply To' cellRenderer={this.applyToCellRenderer}/>
                    </Table>
                </div>
                <div className="settingsTabsDiv">
                    <Tabs id="SettingsTabs">
                        <Tab id="MiningPoolTab" title="Mining Pool" panel={<MiningPoolTab />} />
                        <Tab id="WalletAddressTab" title="Wallet Address" panel={<WalletAddressTab />} />
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
