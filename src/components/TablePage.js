import React from 'react'
import { Button, Checkbox, Icon, InputGroup, Position, Tooltip } from "@blueprintjs/core"
import { Cell, Column, Table } from "@blueprintjs/table"
import { EpicToaster } from './Toasters'

import '@blueprintjs/table/lib/css/table.css'
import './TablePage.css'
import '@blueprintjs/core/lib/css/blueprint.css'

const electron = window.require('electron')

class TablePage extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            pageState: 'loading',
            miners: [],
            isChecked: {
                ip             : true,
                name           : true,
                firmware       : true,
                operatingMode  : true,
                pool           : true,
                user           : true,
                startTime      : false,
                uptime         : true,
                activeHBs      : false,
                hashrate       : true,
                acceptedShares : false,
                rejectedShares : false,
                difficulty     : false,
                temperature    : true,
                power          : false
            },
            columns: {
                "ip": <Column key="ip" name="IP" cellRenderer                    = {this.ipCellRenderer}/>           ,
                "name": <Column key="name" name="Name" cellRenderer                  = {this.nameCellRenderer}/>         ,
                "firmware": <Column key="firmware" name="Firmware" cellRenderer              = {this.firmwareCellRenderer}/>     ,
                "operatingMode": <Column key="operatingMode" name="Operating Mode" cellRenderer        = {this.operatingModeCellRenderer}/>,
                "pool": <Column key="pool" name="Pool" cellRenderer                  = {this.poolCellRenderer}/>         ,
                "user": <Column key="user" name="User" cellRenderer                  = {this.userCellRenderer}/>         ,
                "started": <Column key="started" name="Started" cellRenderer               = {this.startedCellRenderer}/>      ,
                "uptime": <Column key="uptime" name="Uptime" cellRenderer                = {this.uptimeCellRenderer}/>       ,
                "activeHBs": <Column key="activeHBs" name="Active HBs" cellRenderer            = {this.activeHBCellRenderer}/>     ,
                "hashrate": <Column key="hashrate" name="Hashrate (TH/s)" cellRenderer       = {this.hashrateCellRenderer}/>     ,
                "acceptedShares": <Column key="acceptedShares" name="Accepted" cellRenderer              = {this.acceptedCellRenderer}/>     ,
                "rejectedShares": <Column key="rejectedShares" name="Rejected" cellRenderer              = {this.rejectedCellRenderer}/>     ,
                "difficulty": <Column key="difficulty" name="Difficulty" cellRenderer            = {this.difficultyCellRenderer}/>   ,
                "temperature": <Column key="temperature" name={"Temperature \u00b0C"} cellRenderer = {this.temperatureCellRenderer}/>  ,
                "power": <Column key="power" name={"Power (W)"} cellRenderer           = {this.powerCellRenderer}/>        
            }
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

        this.handleColumnVisibility = this.handleColumnVisibility.bind(this);
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

    secondsToHumanReadable(seconds){
        let mutSeconds = seconds;
        const days = Math.floor(seconds / 86400)
        mutSeconds -= days * 86400;
        const hours = Math.floor(mutSeconds / 3600)
        mutSeconds -= hours * 3600;
        const minutes = Math.floor(mutSeconds / 60)
        mutSeconds -= minutes * 60;
        return days+'d'+hours+'h'+minutes+'m'+mutSeconds+'s';
    }

    uptimeCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            return <Cell>{ this.secondsToHumanReadable(this.state.miners[rowIndex].summary.data["Session"]["Uptime"]) }</Cell>
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
    powerCellRenderer = (rowIndex: number) => {
        if (this.state.pageState === 'loading') {
            return <Cell>{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            
            let sumPower = 0;
            if (this.state.miners[rowIndex]){
                const hbs = this.state.miners[rowIndex].summary.data["HBs"];
                if (hbs.length > 0){
                    hbs.forEach(hb => {
                        sumPower += hb["Input Power"];
                    });
                }
            }

            return <Cell>{Math.round(sumPower)}</Cell>
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
            EpicToaster.show({
                message: "Adding miner: " + this.state.newMinerIP,
                timeout: 5000,
                intent: 'success'
            })
        } else {
            EpicToaster.show({
                message: "Please provide an IP",
                timeout: 10000,
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

    handleColumnVisibility(key, e){
        let newIsChecked = this.state.isChecked;
        newIsChecked[key] = e.target.checked;
        this.setState({isChecked: newIsChecked})
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-table');
        electron.ipcRenderer.on('get-table-reply', this.tableGetterHandler);
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-table-reply', this.tableGetterHandler)
    }

    render() {

        let columns = [];
        for (const key of Object.keys(this.state.columns)) {
            if (this.state.isChecked[key]) {
                columns.push(this.state.columns[key])
            }
        }

        return (
            <div className="minersPageContainer">
                <div className="minersTableCategoriesContainer">
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.ip             } onChange={this.handleColumnVisibility.bind(this, 'ip')}>  IP </Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.name           } onChange={this.handleColumnVisibility.bind(this, 'name')}>  Name                </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.firmware       } onChange={this.handleColumnVisibility.bind(this, 'firmware')}>  Firmware            </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.operatingMode  } onChange={this.handleColumnVisibility.bind(this, 'operatingMode')}>  Operating Mode      </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.pool           } onChange={this.handleColumnVisibility.bind(this, 'pool')}>  Pool                </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.user           } onChange={this.handleColumnVisibility.bind(this, 'user')}>  User                </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.startTime      } onChange={this.handleColumnVisibility.bind(this, 'startTime')}>  Start Time          </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.uptime         } onChange={this.handleColumnVisibility.bind(this, 'uptime')}>  Uptime              </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.activeHBs      } onChange={this.handleColumnVisibility.bind(this, 'activeHBs')}>  Active HBs          </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.hashrate       } onChange={this.handleColumnVisibility.bind(this, 'hashrate')}>  Hashrate            </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.acceptedShares } onChange={this.handleColumnVisibility.bind(this, 'acceptedShares')}>  Accepted Shares     </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.rejectedShares } onChange={this.handleColumnVisibility.bind(this, 'rejectedShares')}>  Rejected Shares     </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.difficulty     } onChange={this.handleColumnVisibility.bind(this, 'difficulty')}>  Difficulty          </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.temperature    } onChange={this.handleColumnVisibility.bind(this, 'temperature')}>  {"Temperature \u00b0C"} </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.power          } onChange={this.handleColumnVisibility.bind(this, 'power')}>  Power               </ Checkbox>
                    <Tooltip content="Not including fan consumption" position={Position.BOTTOM_RIGHT}>
                        <Icon className="powerTip" icon="info-sign"/>
                    </Tooltip>
                </div>
                <div className="minersTableContainer">
                    <Table className="minersTable"
                            enableRowHeader={false}
                            numRows={this.state.miners.length}
                            >
                        {columns}
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
