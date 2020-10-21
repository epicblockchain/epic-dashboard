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
            ignoreUpdates: {},
            isSortAscending: Array(5).fill(true)
        }
        this.settingsGetterHandler = this.settingsGetterHandler.bind(this);
        this.ipCellRenderer = this.ipCellRenderer.bind(this);
        this.nameCellRenderer = this.nameCellRenderer.bind(this);
        this.firmwareVersionCellRenderer = this.firmwareVersionCellRenderer.bind(this);
        this.operatingModeCellRenderer = this.operatingModeCellRenderer.bind(this);
        this.walletCellRenderer = this.walletCellRenderer.bind(this);
        this.miningPoolCellRenderer = this.miningPoolCellRenderer.bind(this);
        this.applyToCellRenderer = this.applyToCellRenderer.bind(this);

        this.handleApplyToChange = this.handleApplyToChange.bind(this);
        this.handleApplyClicked = this.handleApplyClicked.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.sortMiners = this.sortMiners.bind(this);
    }

    sortMiners(col){
        let newMiners = this.state.miners;
        newMiners.sort((a, b) => {
            if (a.summary.status !== 'completed'){
                console.log(a.summary.status);
                return (this.state.isSortAscending[col]) ? 1 : -1;
            }
            if (b.summary.status !== 'completed'){
                console.log(b.summary.status);
                return (this.state.isSortAscending[col]) ? -1 : 1;
            }

            try {
                switch(col){
                    case 0:
                        let aIpNum = a.ip.split('.');
                        aIpNum[3] = aIpNum[3].split(':');
                        aIpNum = Math.pow(256, 4) * aIpNum[0] + Math.pow(256, 3) * aIpNum[1] + Math.pow(256, 2) * aIpNum[2] + 256 * aIpNum[3][0] + aIpNum[3][1]
                        let bIpNum = b.ip.split('.');
                        bIpNum[3] = bIpNum[3].split(':');
                        bIpNum = Math.pow(256, 4) * bIpNum[0] + Math.pow(256, 3) * bIpNum[1] + Math.pow(256, 2) * bIpNum[2] + 256 * bIpNum[3][0] + bIpNum[3][1]
                        return aIpNum-bIpNum;
                    case 1:
                        let aData = a.summary.data["Software"].substr(12).split('.');
                        aData = [parseInt(aData[0]), parseInt(aData[1]), parseInt(aData[2])]
                        let bData = b.summary.data["Software"].substr(12).split('.');
                        bData = [parseInt(bData[0]), parseInt(bData[1]), parseInt(bData[2])]
                        if (aData[0] > bData[0]) {
                            return 1;
                        } else if (aData[0] < bData[0]) {
                            return -1;
                        } else {
                            if (aData[1] > bData[1]) {
                                return 1;
                            } else if (aData[1] < bData[1]) {
                                return -1;
                            } else {
                                if (aData[2] > bData[2]) {
                                    return 1;
                                } else if (aData[2] < bData[2]) {
                                    return -1;
                                } else {
                                    return 0;
                                }
                            }
                        }
                    case 2:
                        return (a.summary.data["Preset"].toLowerCase() > b.summary.data["Preset"].toLowerCase()) ? 1 : -1;
                    case 3:
                        return (a.summary.data["Hostname"].toLowerCase() > b.summary.data["Hostname"].toLowerCase()) ? 1 : -1;
                    case 4:
                        return (a.summary.data["Stratum"]["Current Pool"].toLowerCase() > b.summary.data["Stratum"]["Current Pool"].toLowerCase()) ? 1 : -1;
                    default:
                        return 0; //do nothing more
                }
            } catch (err) {
                console.log(err)
                return ( a.ip > b.ip ) ? 1 : -1;
            }
        });
        if (!this.state.isSortAscending[col]){
            newMiners.reverse();
        }
        this.setState({miners: newMiners})
        let newIsSortAscending = this.state.isSortAscending;
        newIsSortAscending[col] = !this.state.isSortAscending[col]
        this.setState({isSortAscending: newIsSortAscending})
    }

    handleSelectionChange(selection){
        if (!selection[0].rows
            && selection[0].cols
            && selection[0].cols[0] === selection[0].cols[1]
            && selection[0].cols[0] < 5){
            this.sortMiners(selection[0].cols[0]);
        }
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
    
    operatingModeCellRenderer(rowIndex: number){
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Preset"]}</Cell>
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
        const currentIps = this.state.miners.map(m => {
            return m.ip;
        });
        let newMiners = this.state.miners;
        args.forEach(newMiner => {
            const idx = currentIps.findIndex((ip) => ip === newMiner.ip);
            if (idx === -1){
                newMiners.push(newMiner);
            } else {
                newMiners[idx] = newMiner;
            }
        });
        this.setState({miners: newMiners});


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

    handleCopy(rowIndex: number, col: number){
        switch(col) {
            case 0:
                return this.state.miners[rowIndex].ip;
            case 1:
                return this.state.miners[rowIndex].summary.data["Software"];
            case 2:
                return this.state.miners[rowIndex].summary.data["Stratum"]["Current User"];
            case 3:
                return this.state.miners[rowIndex].summary.data["Stratum"]["Current Pool"];
            default:
                console.log('bad copypaste');
                return '';
        }
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
                    <Table getCellClipboardData={this.handleCopy}
                            enableRowHeader={false}
                            numRows={this.state.miners.length}
                            onSelection={this.handleSelectionChange}>
                        <Column name='IP' cellRenderer={this.ipCellRenderer} />
                        <Column name='Firmware Version' cellRenderer={this.firmwareVersionCellRenderer} />
                        <Column name='Preset' cellRenderer={this.operatingModeCellRenderer} />
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
