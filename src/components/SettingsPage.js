import React from 'react'
import { Button, InputGroup, Switch, Tab, Tabs } from '@blueprintjs/core'
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
        this.settingsGetterHandler       = this.settingsGetterHandler.bind(this);
        this.ipCellRenderer              = this.ipCellRenderer.bind(this);
        this.nameCellRenderer            = this.nameCellRenderer.bind(this);
        this.firmwareVersionCellRenderer = this.firmwareVersionCellRenderer.bind(this);
        this.operatingModeCellRenderer   = this.operatingModeCellRenderer.bind(this);
        this.walletCellRenderer          = this.walletCellRenderer.bind(this);
        this.miningPoolCellRenderer      = this.miningPoolCellRenderer.bind(this);
        this.applyToCellRenderer         = this.applyToCellRenderer.bind(this);

        this.handleApplyToChange         = this.handleApplyToChange.bind(this);
        this.handleApplyClicked          = this.handleApplyClicked.bind(this);
        this.handleCopy                  = this.handleCopy.bind(this);
        this.handleSelectionChange       = this.handleSelectionChange.bind(this);
        this.sortMiners                  = this.sortMiners.bind(this);

        this.selectAll                   = this.selectAll.bind(this);
        this.deselectAll                 = this.deselectAll.bind(this);

        this.hasSomeMinersSelected       = this.hasSomeMinersSelected.bind(this);

        this.handleFilterChange          = this.handleFilterChange.bind(this);
    }

    stringifyMinerForSearch(miner){
        if (miner.rebooting) {
            return miner.ip + " Rebooting";
        } else if (miner.summary.status === 'empty') {
            return miner.ip + " Loading";
        } else if (miner.summary.status === 'completed') {

            let str = miner.ip + ' ';
            str += miner.summary.data["Preset"] + ' ';
            str += miner.summary.data["Stratum"]["Current Pool"] + ' ';
            str += miner.summary.data["Stratum"]["Current User"] + ' ';
            str += miner.summary.data["Software"] + ' ';
            return str;

        } else {
            return miner.ip + " Error";
        }


    }

    handleFilterChange(e){
        let newMiners = this.state.miners;
        newMiners.forEach( m => {
            m.visible = this.stringifyMinerForSearch(m).includes(e.target.value);
        });
        this.setState({miners: newMiners});
        
    }

    hasSomeMinersSelected(){
        let ret = false;
        this.state.miners.forEach(m => {
            if (m.isChecked) ret = true;
        });

        return ret;
    }

    sortMiners(col){
        let newMiners = this.state.miners;
        newMiners.sort((a, b) => {
            if (a.summary.status !== 'completed'){
                return (this.state.isSortAscending[col]) ? 1 : -1;
            }
            if (b.summary.status !== 'completed'){
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

    getBadHashboards(rowIndex){
        let goodHBs = [];
        let possibleHBs = [0,1,2];
        let badHBs = [];
        this.state.miners[rowIndex].summary.data["HBs"].forEach(hb => {
            goodHBs.push(hb.Index);
        });

        possibleHBs.forEach(phb => {
            if (!goodHBs.includes(phb)){
                badHBs.push(phb);
            }
        });
        return badHBs;
    }

    errorCellRenderer(rowIndex: number, cell_contents_closure){
        if (this.state.pageState === 'loading') {
            return <Cell intent="warning">{"Loading"}</Cell>;
        } else if (this.state.miners[rowIndex].rebooting) {
            return <Cell intent="warning">{"Rebooting"}</Cell>;
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell intent="warning">{"Loading"}</Cell>;
        } else if (this.state.miners[rowIndex].summary.status === 'completed'){
            let cellIntent = "";
            try {
                const numBadHBs = this.getBadHashboards(rowIndex).length;
                if (numBadHBs === 3){
                    cellIntent = "danger";
                } else if (numBadHBs > 0){
                    cellIntent = "warning";
                }
            } catch {
                cellIntent = "warning";
            }
            return <Cell intent={cellIntent}>{cell_contents_closure()}</Cell>
        } else {
            return <Cell intent="danger">{"Error"}</Cell>;
        }
    }

    getNthVisibleMinerIndex(rowIndex){
        let count = 0;
        const miners = this.state.miners;
        for (let i = 0; i < miners.length; i++){
            const m = miners[i];
            if (m.visible){
                if (count === rowIndex){
                    return i;
                } else {
                    count += 1;
                }
            }
        }
        console.log('count: ', count);
        console.log('rowIndex: ', rowIndex);
        console.log('numVisible: ', miners.filter(m => m.visible).length);

        throw new Error("Higher rowIndex than number of visible miners");
    }

    getVisibleMiners(){
        const miners = this.state.miners;
        return miners.filter(m => m.visible);
    }

    ipCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, () => { return this.state.miners[rowIndex].ip} );
    }

    nameCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Hostname"]});
    }

    firmwareVersionCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Software"]});
    }
    
    operatingModeCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Preset"]});
    }

    walletCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Stratum"]["Current User"]});
    }

    miningPoolCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Stratum"]["Current Pool"]});
    }

    handleApplyToChange(e){
        let newMiners = this.state.miners;
        const idx = newMiners.findIndex(el => el.ip === e.target.value)
        if (idx === -1){
            console.log('could not find ip in apply to change')
            return;
        }
        newMiners[idx].isChecked = !newMiners[idx].isChecked;
        this.setState({miners: newMiners});
    }

    applyToCellRenderer(rowIndex: number){
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        const isDisabled = this.state.miners[rowIndex].summary.status !== 'completed';
        return <Cell><Switch value={this.state.miners[rowIndex].ip} checked={this.state.miners[rowIndex].isChecked || false} disabled={isDisabled} onChange={this.handleApplyToChange} /></Cell>
    }

    handleApplyClicked(arg, e){
        arg.state.miners = this.state.miners.map( m => {
            return {
                isChecked: m.isChecked,
                ip: m.ip
            };
        });
        //deselect all AFTER getting miners
        if (arg.tab === 'firmware'
            || arg.tab === 'operating-mode'
            || arg.tab === 'hwconfig'
            || arg.tab === 'reboot'
        ){
            let newMiners = this.state.miners;
            newMiners.forEach(m => {
                m.isChecked = false;
            });
            this.setState({miners: newMiners});
        }
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
                newMiner.isChecked = false;
                newMiner.visible = true;
                newMiners.push(newMiner);
            } else {
                newMiner.isChecked = newMiners[idx].isChecked; //persist checkbox data -> maybe this can be kept seperately but performance seems to be aboutthe same
                //also persist visibility
                const oldVisibility = newMiners[idx].visible;
                newMiners[idx] = newMiner;
                newMiners[idx].visible = oldVisibility;
            }
        });
        this.setState({miners: newMiners});


        this.setState({pageState: 'loaded'})
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

    selectAll(){
        const newMiners = this.state.miners.map(el => {
            if (el.summary.status !== 'completed') {
                return el;
            }
            let newMiner = el;
            newMiner.isChecked = el.visible;
            return newMiner;
        });
        this.setState({miners: newMiners});
    }

    deselectAll(){
        const newMiners = this.state.miners.map(el => {
            if (el.summary.status !== 'completed') {
                return el;
            }
            let newMiner = el;
            newMiner.isChecked = false;
            return newMiner;
        });
        this.setState({miners: newMiners});
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
                <div className="minerSearchBarContianer">
                    <InputGroup
                        leftIcon="filter"
                        onChange={this.handleFilterChange}
                        placeholder="Filter table..."
                    />
                </div>
                <div className="settingsTableDiv">
                    <div className="selectionButtons">
                        <Button className="selectionButton" icon="circle" onClick={this.deselectAll} />
                        <Button className="selectionButton" icon="selection" onClick={this.selectAll} />
                    </div>
                    <Table getCellClipboardData={this.handleCopy}
                            enableRowHeader={false}
                            numRows={this.getVisibleMiners().length}
                            onSelection={this.handleSelectionChange}>
                        <Column name='IP' cellRenderer={this.ipCellRenderer} />
                        <Column name='Firmware Version' cellRenderer={this.firmwareVersionCellRenderer} />
                        <Column name='Preset' cellRenderer={this.operatingModeCellRenderer} />
                        <Column name='Miner Name' cellRenderer={this.nameCellRenderer} />
                        <Column name='Wallet' cellRenderer={this.walletCellRenderer} />
                        <Column name='Mining Pool' cellRenderer={this.miningPoolCellRenderer} />
                        <Column name="Apply To" cellRenderer={this.applyToCellRenderer} />
                    </Table>
                </div>
                <div className="settingsTabsDiv">
                    <Tabs id="SettingsTabs">
                        <Tab id="MiningPoolTab"
                            title="Mining Pool"
                            panel={<MiningPoolTab
                                applyClicked={this.handleApplyClicked}
                                hasSomeMinersSelected={this.hasSomeMinersSelected}
                                />} />
                        <Tab id="WalletAddressTab"
                             title="Wallet Address"
                             panel={<WalletAddressTab
                                 applyClicked={this.handleApplyClicked}
                                 hasSomeMinersSelected={this.hasSomeMinersSelected}
                            />} />
                        <Tab id="OperatingModeTab"
                             title="Operating Mode" 
                             panel={<OperatingModeTab
                                        applyClicked={this.handleApplyClicked}
                                        hasSomeMinersSelected={this.hasSomeMinersSelected}/>} />
                        <Tab id="UniqueIDTab"
                            title="Unique ID"
                            panel={<UniqueIDTab
                                    applyClicked={this.handleApplyClicked}
                                    hasSomeMinersSelected={this.hasSomeMinersSelected}
                                />} />
                        <Tab id="PasswordTab"
                             title="Password"
                             panel={<PasswordTab
                                    applyClicked={this.handleApplyClicked}
                                    hasSomeMinersSelected={this.hasSomeMinersSelected}
                                 />} />
                        <Tab id="FirmwareTab"
                             title="Firmware"
                             panel={<FirmwareTab
                                    applyClicked={this.handleApplyClicked}
                                    hasSomeMinersSelected={this.hasSomeMinersSelected}
                                 />} />
                        <Tab id="RebootTab"
                             title="Reboot"
                             panel={<RebootTab
                                    applyClicked={this.handleApplyClicked}
                                    hasSomeMinersSelected={this.hasSomeMinersSelected}
                                 />} />
                        <Tab id="HWConfigTab"
                            title="Recalibrate"
                            panel={
                                <HardwareConfigTab
                                applyClicked={this.handleApplyClicked}
                                hasSomeMinersSelected={this.hasSomeMinersSelected}
                                />
                            }/>
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default SettingsPage;
