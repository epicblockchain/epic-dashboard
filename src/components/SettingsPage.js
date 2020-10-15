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
        this.walletCellRenderer = this.walletCellRenderer.bind(this);
        this.miningPoolCellRenderer = this.miningPoolCellRenderer.bind(this);
        this.applyToCellRenderer = this.applyToCellRenderer.bind(this);

        this.handleApplyToChange = this.handleApplyToChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleApplyClicked = this.handleApplyClicked.bind(this);
        //miningpool
        this.handleMiningPoolChange = this.handleMiningPoolChange.bind(this);
        //walletaddress
        this.handleWalletAddressChange = this.handleWalletAddressChange.bind(this);
        this.handleWorkerNameChange = this.handleWorkerNameChange.bind(this);
        //operatingmode
        this.handleOperatingModeChange = this.handleOperatingModeChange.bind(this);
        //uniqueid
        this.handleAppendUniqueIDChange = this.handleAppendUniqueIDChange.bind(this);
        //password
        this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this);
        this.handleVerifyPasswordChange = this.handleVerifyPasswordChange.bind(this);
        //firmware
        this.handleReuseHardwareConfigChange = this.handleReuseHardwareConfigChange.bind(this)
        this.handleFirmwareFileChange = this.handleFirmwareFileChange.bind(this)
        //reboot
        this.handleReboot = this.handleReboot.bind(this)
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
        return <Cell><Switch value={rowIndex} defaultChecked={false} disabled={isDisabled} onChange={this.handleApplyToChange} /></Cell>
    }

    handleApplyClicked(arg, e){
        electron.ipcRenderer.send('post-settings', {
            state: this.state,
            tab: arg
        });
    }

    handleMiningPoolChange(e){
        this.setState({miningPool: e.target.value})
    }

    handlePasswordChange(e){
        this.setState({password: e.target.value})
    }


    handleOperatingModeChange(e){
        this.setState({operatingMode: e.target.value})
    }

    settingsGetterHandler(event, args){
        console.log(this.state.applyTo)
        console.log(this.state.ignoreUpdates)
        console.log(' ')
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

    handleWalletAddressChange(e){
        this.setState({walletAddress: e.target.value})
    }

    handleWorkerNameChange(e){
        this.setState({workerName: e.target.value})
    }

    handleAppendUniqueIDChange(e){
        this.setState({appendUniqueID: e.target.checked})
    }

    handleNewPasswordChange(e){
        this.setState({newPassword: e.target.value})
    }

    handleVerifyPasswordChange(e){
        this.setState({verifyPassword: e.target.value})
    }

    handleReuseHardwareConfigChange(e){
        this.setState({reuseHardwareConfig: e.target.checked})
    }

    handleFirmwareFileChange(file){
        this.setState({swuFilepath: file})
        this.setState({filePathSelected: true})
        console.log(file)
    }

    handleReboot(e){
        this.setState({rebootDelay: e.target.value})
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
                                />} />
                        <Tab id="WalletAddressTab"
                             title="Wallet Address"
                             panel={<WalletAddressTab
                                 updateWalletAddress={this.handleWalletAddressChange}
                                 updateWorkerName={this.handleWorkerNameChange}
                                 updatePassword={this.handlePasswordChange}
                                 applyClicked={this.handleApplyClicked}
                            />} />
                        <Tab id="OperatingModeTab"
                             title="Operating Mode" 
                             panel={<OperatingModeTab
                                updateOperatingMode={this.handleOperatingModeChange}
                                updatePassword={this.handlePasswordChange}
                                operatingMode={this.state.operatingMode}
                                applyClicked={this.handleApplyClicked}/>} />
                        <Tab id="UniqueIDTab"
                            title="Unique ID"
                            panel={<UniqueIDTab
                                    updateAppendUniqueID={this.handleAppendUniqueIDChange}
                                    updatePassword={this.handlePasswordChange}
                                    applyClicked={this.handleApplyClicked}
                                />} />
                        <Tab id="PasswordTab"
                             title="Password"
                             panel={<PasswordTab
                                    updateNewPassword={this.handleNewPasswordChange}
                                    updateVerifyPassword={this.handleVerifyPasswordChange}
                                    updatePassword={this.handlePasswordChange}
                                    applyClicked={this.handleApplyClicked}
                                 />} />
                        <Tab id="FirmwareTab"
                             title="Firmware"
                             panel={<FirmwareTab
                                    updateFirmwareFile={this.handleFirmwareFileChange}
                                    swuFilepath={this.state.swuFilepath}
                                    updateReuseHardwareConfig={this.handleReuseHardwareConfigChange}
                                    updatePassword={this.handlePasswordChange}
                                    applyClicked={this.handleApplyClicked}
                                 />} />
                        <Tab id="RebootTab"
                             title="Reboot"
                             panel={<RebootTab
                                    updateReboot={this.handleReboot}
                                    updatePassword={this.handlePasswordChange}
                                    applyClicked={this.handleApplyClicked}
                                 />} />
                        <Tab id="HWConfigTab"
                            title="Recalibrate"
                            panel={
                                <HardwareConfigTab
                                updatePassword={this.handlePasswordChange}
                                applyClicked={this.handleApplyClicked}/>
                            }/>
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default SettingsPage;
