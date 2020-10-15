import React from 'react'
import { Button, InputGroup } from "@blueprintjs/core"
import { Cell, Column, Table } from "@blueprintjs/table"
import { BadToaster, GoodToaster } from './Toasters'

import '@blueprintjs/table/lib/css/table.css'
import './TablePage.css'
import '@blueprintjs/core/lib/css/blueprint.css'

const electron = window.require('electron')

class TablePage extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            pageState: 'loading',
            miners: []
        }
        this.tableGetterHandler        = this.tableGetterHandler.bind(this);
        this.ipCellRenderer            = this.ipCellRenderer.bind(this);
        this.nameCellRenderer          = this.nameCellRenderer.bind(this);
        this.firmwareCellRenderer      = this.firmwareCellRenderer.bind(this);
        this.operatingModeCellRenderer = this.operatingModeCellRenderer.bind(this);
        this.poolCellRenderer          = this.poolCellRenderer.bind(this);
        this.userCellRenderer          = this.userCellRenderer.bind(this);
        this.startedCellRenderer       = this.startedCellRenderer.bind(this);
        this.uptimeCellRenderer        = this.uptimeCellRenderer.bind(this);
        this.activeHBCellRenderer      = this.activeHBCellRenderer.bind(this);
        this.hashrateCellRenderer      = this.hashrateCellRenderer.bind(this);
        this.acceptedCellRenderer      = this.acceptedCellRenderer.bind(this);
        this.rejectedCellRenderer      = this.rejectedCellRenderer.bind(this);
        this.difficultyCellRenderer    = this.difficultyCellRenderer.bind(this);
        this.temperatureCellRenderer   = this.temperatureCellRenderer.bind(this);

        this.addNewMiner = this.addNewMiner.bind(this);
        this.handleNewMinerIpChange = this.handleNewMinerIpChange.bind(this);
        this.loadPreviousMiners = this.loadPreviousMiners.bind(this);
    }

    tableGetterHandler(event, args){
        this.setState({miners: args})
        this.setState({pageState: 'loaded'})
    }

    ipCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else {
            return <Cell>{this.state.miners[rowIndex].ip}</Cell>
        }
    }
    nameCellRenderer = (rowIndex: number) => {
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
    operatingModeCellRenderer = (rowIndex: number) => {
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
    firmwareCellRenderer = (rowIndex: number) => {
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
    poolCellRenderer = (rowIndex: number) => {
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
    userCellRenderer = (rowIndex: number) => {
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
    startedCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{new Date(this.state.miners[rowIndex].summary.data["Session"]["Startup Timestamp"] * 1000).toString()}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    uptimeCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{new Date(this.state.miners[rowIndex].summary.data["Session"]["Uptime"] * 1000 - Date.now()).toISOString().substr(11, 8)}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    activeHBCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["HBs"].length}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    hashrateCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{Math.round(this.state.miners[rowIndex].summary.data["Session"]["Average MHs"] / 10000) / 100}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    acceptedCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Session"]["Accepted"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    rejectedCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Session"]["Rejected"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    difficultyCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{this.state.miners[rowIndex].summary.data["Session"]["Difficulty"]}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }
    temperatureCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            
            let maxTemp = "N/A";
            if (this.state.miners[rowIndex]){
                const hbs = this.state.miners[rowIndex].summary.data["HBs"];
                if (hbs.length > 0){
                    maxTemp = 0
                    hbs.forEach(hb => {
                        const newTemp = hb["Temperature"];
                        if (newTemp > maxTemp){
                            maxTemp = newTemp
                        }
                    });
                }
            }

            return <Cell>{maxTemp}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else {
            return <Cell>{"Error"}</Cell>
        }
    }

    addNewMiner(){
        if (this.state.newMinerIP){
            if (this.state.newMinerIP.includes(':')){
                electron.ipcRenderer.send('add-new-miners', [this.state.newMinerIP])
            } else {
                electron.ipcRenderer.send('add-new-miners', [this.state.newMinerIP + ':4028'])
            }
        } else {
            BadToaster.show({
                message: "Please provide an IP",
                timeout: 0,
                intent: 'danger'
            })
        }
    }

    handleNewMinerIpChange(e){
        this.setState({newMinerIP: e.target.value})
    }

    saveCurrentMiners(){
        electron.ipcRenderer.send('save-current-miners');
    }

    loadPreviousMiners(){
        electron.ipcRenderer.send('load-previous-miners');
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-table');
        electron.ipcRenderer.on('get-table-reply', this.tableGetterHandler);
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-table-reply', this.tableGetterHandler)
    }

    render() {
        return (
            <div className="minersPageContainer">
                <div className="minersTableContainer">
                    <Table className="minersTable" enableRowHeader={false} numRows={this.state.miners.length}>
                        <Column name="IP" cellRenderer                    = {this.ipCellRenderer}/>
                        <Column name="Name" cellRenderer                  = {this.nameCellRenderer}/>
                        <Column name="Firmware" cellRenderer              = {this.firmwareCellRenderer}/>
                        <Column name="Operating Mode" cellRenderer        = {this.operatingModeCellRenderer}/>
                        <Column name="Pool" cellRenderer                  = {this.poolCellRenderer}/>
                        <Column name="User" cellRenderer                  = {this.userCellRenderer}/>
                        <Column name="Started" cellRenderer               = {this.startedCellRenderer}/>
                        <Column name="Uptime" cellRenderer                = {this.uptimeCellRenderer}/>
                        <Column name="Active HBs" cellRenderer            = {this.activeHBCellRenderer}/>
                        <Column name="Hashrate (TH/s)" cellRenderer       = {this.hashrateCellRenderer}/>
                        <Column name="Accepted" cellRenderer              = {this.acceptedCellRenderer}/>
                        <Column name="Rejected" cellRenderer              = {this.rejectedCellRenderer}/>
                        <Column name="Difficulty" cellRenderer            = {this.difficultyCellRenderer}/>
                        <Column name={"Temperature \u00b0C"} cellRenderer = {this.temperatureCellRenderer}/>
                    </Table>
                </div>
                <div className="newMinersFormContainer">
                    <h4>{"Add new miners"}</h4>
                    <InputGroup placeholder="IP" onChange={this.handleNewMinerIpChange}/>  
                    <Button className="addMinerButton" icon="plus" text="Add Miner via IP" onClick={this.addNewMiner} />
                    <Button className="saveMinerButton" icon="floppy-disk" text="Save current miners" onClick={this.saveCurrentMiners} />
                    <Button className="loadMinerButton" icon="bring-data" text="Load previously added miners" onClick={this.loadPreviousMiners} />
                </div>
            </div>
        );
    }
}

export default TablePage;
