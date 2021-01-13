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
            miners: [],
            isChecked: {
                ip             : true,
                name           : true,
                firmware       : true,
                operatingMode  : true,
                pool           : true,
                user           : true,
                startTime      : false,
                uptime         : false,
                activeHBs      : true,
                hashrate1hr    : true,
                hashrate24hr   : false,
                acceptedShares : false,
                rejectedShares : false,
                difficulty     : false,
                temperature    : true,
                power          : false,
                remove : false
            },
            columns: {
                "ip"             : <Column key="ip"             name="IP"                    cellRenderer={this.ipCellRenderer}/>           ,
                "name"           : <Column key="name"           name="Name"                  cellRenderer={this.nameCellRenderer}/>         ,
                "firmware"       : <Column key="firmware"       name="Firmware"              cellRenderer={this.firmwareCellRenderer}/>     ,
                "operatingMode"  : <Column key="operatingMode"  name="Operating Mode"        cellRenderer={this.operatingModeCellRenderer}/>,
                "pool"           : <Column key="pool"           name="Pool"                  cellRenderer={this.poolCellRenderer}/>         ,
                "user"           : <Column key="user"           name="User"                  cellRenderer={this.userCellRenderer}/>         ,
                "started"        : <Column key="started"        name="Started"               cellRenderer={this.startedCellRenderer}/>      ,
                "uptime"         : <Column key="uptime"         name="Uptime"                cellRenderer={this.uptimeCellRenderer}/>       ,
                "activeHBs"      : <Column key="activeHBs"      name="Active HBs"            cellRenderer={this.activeHBCellRenderer}/>     ,
                "hashrate1hr"    : <Column key="hashrate1hr"    name="Hashrate 1hr (TH/s)"       cellRenderer={this.hashrate1hrCellRenderer}/>     ,
                "hashrate24hr"   : <Column key="hashrate24hr"   name="Hashrate 24hr (TH/s)"       cellRenderer={this.hashrate24hrCellRenderer}/>     ,
                "acceptedShares" : <Column key="acceptedShares" name="Accepted"              cellRenderer={this.acceptedCellRenderer}/>     ,
                "rejectedShares" : <Column key="rejectedShares" name="Rejected"              cellRenderer={this.rejectedCellRenderer}/>     ,
                "difficulty"     : <Column key="difficulty"     name="Difficulty"            cellRenderer={this.difficultyCellRenderer}/>   ,
                "temperature"    : <Column key="temperature"    name={"Temperature \u00b0C"} cellRenderer={this.temperatureCellRenderer}/>  ,
                "power"          : <Column key="power"          name="Power (W)"             cellRenderer={this.powerCellRenderer}/>,
                "remove"         : <Column key="remove"          name="Remove Miner"         cellRenderer={this.removeCellRenderer}/>,
            },
            colIdxToKey: [
                'ip',
                'name',
                'firmware',
                'operatingMode',
                'pool',
                'user',
                'started',
                'uptime',
                'activeHBs',
                'hashrate1hr',
                'hashrate24hr',
                'acceptedShares',
                'rejectedShares',
                'difficulty',
                'temperature',
                'power',
                'remove'
            ],
            isSortAscending: {
                ip             : true,
                name           : true,
                firmware       : true,
                operatingMode  : true,
                pool           : true,
                user           : true,
                started        : true,
                uptime         : true,
                activeHBs      : true,
                hashrate1hr    : true,
                hashrate24hr   : true,
                acceptedShares : true,
                rejectedShares : true,
                difficulty     : true,
                temperature    : true,
                power          : true,
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
        this.hashrate1hrCellRenderer      = this.hashrate1hrCellRenderer.bind(this);
        this.hashrate24hrCellRenderer      = this.hashrate24hrCellRenderer.bind(this);
        this.acceptedCellRenderer      = this.acceptedCellRenderer.bind(this);
        this.rejectedCellRenderer      = this.rejectedCellRenderer.bind(this);
        this.difficultyCellRenderer    = this.difficultyCellRenderer.bind(this);
        this.temperatureCellRenderer   = this.temperatureCellRenderer.bind(this);
        this.removeCellRenderer        = this.removeCellRenderer.bind(this);

        this.addNewMiner = this.addNewMiner.bind(this);
        this.handleNewMinerIpChange = this.handleNewMinerIpChange.bind(this);
        this.loadPreviousMiners = this.loadPreviousMiners.bind(this);

        this.handleColumnVisibility = this.handleColumnVisibility.bind(this);
        this.handleCopy = this.handleCopy.bind(this);

        this.getKeyFromColumnIndex = this.getKeyFromColumnIndex.bind(this);
        this.handleColumnReordering = this.handleColumnReordering.bind(this);
        
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.sortMiners = this.sortMiners.bind(this);

        this.handleRemoveMiner = this.handleRemoveMiner.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
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
            return miner.ip + " Error"
        }
    }

    handleFilterChange(e){
        let newMiners = this.state.miners;
        newMiners.forEach(m => {
            m.visible = this.stringifyMinerForSearch(m).includes(e.target.value)
        });
        this.setState({miners: newMiners});
    }

    getVisibleMiners(){
        const miners = this.state.miners;
        return miners.filter(m => m.visible);
    }

    handleSelectionChange(selection){
        //conditions when only a single column is selected (by click); honestly its a hack but its the only exposed api I see
        if (!selection[0].rows
            && selection[0].cols
            && (selection[0].cols[0] === selection[0].cols[1]))
        {
            const key = this.getKeyFromColumnIndex(selection[0].cols[0]);
            this.sortMiners(key);
        }
    }

    sortMiners(key){
        let newMiners = this.state.miners;
        newMiners.sort((a, b) => {
            if (a.summary.status !== 'completed'){
                return (this.state.isSortAscending[key]) ? 1 : -1;
            }
            if (b.summary.status !== 'completed'){
                return (this.state.isSortAscending[key]) ? -1 : 1;
            }

            try {
                switch(key){
                    case 'ip':
                        let aIpNum = a.ip.split('.');
                        aIpNum[3] = aIpNum[3].split(':');
                        aIpNum = Math.pow(256, 4) * aIpNum[0] + Math.pow(256, 3) * aIpNum[1] + Math.pow(256, 2) * aIpNum[2] + 256 * aIpNum[3][0] + aIpNum[3][1]
                        let bIpNum = b.ip.split('.');
                        bIpNum[3] = bIpNum[3].split(':');
                        bIpNum = Math.pow(256, 4) * bIpNum[0] + Math.pow(256, 3) * bIpNum[1] + Math.pow(256, 2) * bIpNum[2] + 256 * bIpNum[3][0] + bIpNum[3][1]
                        return aIpNum-bIpNum;
                    case 'name':
                        return (a.summary.data["Hostname"].toLowerCase() > b.summary.data["Hostname"].toLowerCase()) ? 1 : -1;
                    case 'firmware':
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
                    case 'operatingMode':
                        return (a.summary.data["Preset"].toLowerCase() > b.summary.data["Preset"].toLowerCase()) ? 1 : -1;
                    case 'pool':
                        return (a.summary.data["Stratum"]["Current Pool"].toLowerCase() > b.summary.data["Stratum"]["Current Pool"].toLowerCase()) ? 1 : -1;
                    case 'user':
                        return (a.summary.data["Stratum"]["Current User"].toLowerCase() > b.summary.data["Stratum"]["Current User"].toLowerCase()) ? 1 : -1;
                    case 'started':
                        return a.summary.data["Session"]["Startup Timestamp"] - b.summary.data["Session"]["Startup Timestamp"];
                    case 'uptime':
                        return a.summary.data["Session"]["Uptime"] - b.summary.data["Session"]["Uptime"];
                    case 'activeHBs':
                        return a.summary.data["HBs"].length - b.summary.data["HBs"].length;
                    case 'hashrate1hr':
                        return 'todo';
                        return a.summary.data["Session"]["Average MHs"] - b.summary.data["Session"]["Average MHs"];
                    case 'hashrate24hr':
                        return 'todo';
                        return a.summary.data["Session"]["Average MHs"] - b.summary.data["Session"]["Average MHs"];
                    case 'acceptedShares':
                        return a.summary.data["Session"]["Accepted"] - b.summary.data["Session"]["Accepted"];
                    case 'rejectedShares':
                        return a.summary.data["Session"]["Rejected"] - b.summary.data["Session"]["Rejected"];
                    case 'difficulty':
                        return a.summary.data["Session"]["Difficulty"] - b.summary.data["Session"]["Difficulty"];
                    case 'temperature':
                        let aMaxTemp = null;
                        a.summary.data["HBs"].forEach(hb => {
                            if (aMaxTemp === null || aMaxTemp < hb["Temperature"]){
                                aMaxTemp = hb["Temperature"];
                            }
                        });
                        if (aMaxTemp === null){
                            return -1;
                        }
                        let bMaxTemp = null;
                        b.summary.data["HBs"].forEach(hb => {
                            if (bMaxTemp === null || bMaxTemp < hb["Temperature"]){
                                bMaxTemp = hb["Temperature"];
                            }
                        });
                        if (bMaxTemp === null){
                            return -1;
                        }
                        return aMaxTemp - bMaxTemp;
                    case 'power':
                        let aPower = null;
                        a.summary.data["HBs"].forEach(hb => {
                            if (aPower === null){
                                aPower = 0;
                            }
                            aPower += hb["Input Power"];
                        });
                        if (aPower === null){
                            return -1;
                        }
                        let bPower = null;
                        b.summary.data["HBs"].forEach(hb => {
                            if (bPower === null){
                                bPower = 0;
                            }
                            bPower += hb["Input Power"];
                        });
                        if (bPower === null){
                            return -1;
                        }
                        return aPower - bPower;
                    default:
                        return 0; //do nothing more
                }
            } catch (err) {
                console.log(err)
                return ( a.ip > b.ip ) ? 1 : -1;
            }
        });
        if (!this.state.isSortAscending[key]){
            newMiners.reverse();
        }
        this.setState({miners: newMiners})
        let newIsSortAscending = this.state.isSortAscending;
        newIsSortAscending[key] = !this.state.isSortAscending[key]
        this.setState({isSortAscending: newIsSortAscending})
    }

    //reorders columns idx to key
    handleColumnReordering(oldIndex, newIndex, length){
        console.log(oldIndex);
        console.log(newIndex);
        console.log(length);
        let modelOfColumns = [];//only the visible columns, put the other columns at the end
        let invisibleColumns = [];
        const len = this.state.colIdxToKey.length;
        for(let i = 0; i < len; i++){
            if (this.state.isChecked[this.state.colIdxToKey[i]]){
                modelOfColumns.push(this.state.colIdxToKey[i]);
            } else {
                invisibleColumns.push(this.state.colIdxToKey[i]);
            }
        }
        invisibleColumns.forEach(i => {
            modelOfColumns.push(i);
        })
        //modelOfColumns is what the user sees appended by the invis columns, should be ok to just splice stuff around
        let grabbed = modelOfColumns.splice(oldIndex, length);
        modelOfColumns.splice(newIndex, 0, ...grabbed);
        this.setState({colIdxToKey: modelOfColumns});
    }

    tableGetterHandler(event, args){
        const currentIps = this.state.miners.map(m => {
            return m.ip;
        });
        let newMiners = this.state.miners;
        args.forEach(newMiner => {
            const idx = currentIps.findIndex((ip) => ip === newMiner.ip);
            if (idx === -1){
                //append and default to visible
                newMiner.visible = true;
                newMiners.push(newMiner);
            } else {
                //update
                const oldVisible = newMiners[idx].visible;
                newMiners[idx] = newMiner;
                newMiners[idx].visible = oldVisible;
            }
        })
        
        this.setState({miners: newMiners})
    }

    ipCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        if (this.state.pageState === 'loading') {
            return <Cell intent="warning">{"Loading"}</Cell>
        } else {
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
            return <Cell intent={cellIntent}>{this.state.miners[rowIndex].ip}</Cell>
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
        throw new Error("Higher rowIndex than number of visible miners");
    }

    errorCellRenderer(rowIndex: number, cell_contents_closure){
        if (this.state.pageState === 'loading') {
            return <Cell intent="warning">{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].rebooting) {
            return <Cell intent="warning">{"Rebooting"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'empty') {
            return <Cell intent="warning">{"Loading"}</Cell>
        } else if (this.state.miners[rowIndex].summary.status === 'completed') {
            let cellIntent = "";
            const numBadHBs = this.getBadHashboards(rowIndex).length;
            if (numBadHBs === 3){
                cellIntent = "danger";
            } else if (numBadHBs > 0) {
                cellIntent = "warning";
            }
            return <Cell intent={cellIntent}>{cell_contents_closure()}</Cell>
        } else {
            return <Cell intent="danger">{"Error"}</Cell>
        }
    }

    nameCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex,()=>{ return this.state.miners[rowIndex].summary.data["Hostname"] });
    }

    operatingModeCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex,()=>{ return this.state.miners[rowIndex].summary.data["Preset"]});
    }

    firmwareCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex,()=>{ return this.state.miners[rowIndex].summary.data["Software"]});
    }

    poolCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{return this.state.miners[rowIndex].summary.data["Stratum"]["Current Pool"]});
    }

    userCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Stratum"]["Current User"]});
    }

    startedCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{return new Date(this.state.miners[rowIndex].summary.data["Session"]["Startup Timestamp"] * 1000).toString()});
    }

    secondsToHumanReadable(seconds){
        let mutSeconds = seconds;
        const days = Math.floor(seconds / 86400)
        mutSeconds -= days * 86400;
        const hours = Math.floor(mutSeconds / 3600)
        mutSeconds -= hours * 3600;
        const minutes = Math.floor(mutSeconds / 60)
        mutSeconds -= minutes * 60;
        return days+'d '+hours+'h '+minutes+'m '+mutSeconds+'s';
    }

    uptimeCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.secondsToHumanReadable(this.state.miners[rowIndex].summary.data["Session"]["Uptime"]) });
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
                })
                return badHBs;
    }

    activeHBCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        let cell_contents_closure = () => {
            let cellText = this.state.miners[rowIndex].summary.data["HBs"].length;
            if (this.state.miners[rowIndex].summary.data["HBs"].length === 3 && true){
                return cellText;
            } else {
                const badHBs = this.getBadHashboards(rowIndex);
                return cellText + ' (Down: ' + badHBs.toString() + ')';
            }
        }
        return this.errorCellRenderer(rowIndex, cell_contents_closure);
    }

    hashrate1hrCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return <Cell>todo</Cell>;
        return this.errorCellRenderer(rowIndex, ()=>{ return Math.round(this.state.miners[rowIndex].summary.data["Session"]["Average MHs"] / 10000) / 100});
    }
    hashrate24hrCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        console.log(this.state.miners[0])
        return <Cell>todo</Cell>;
        return this.errorCellRenderer(rowIndex, ()=>{ return Math.round(this.state.miners[rowIndex].summary.data["Session"]["Average MHs"] / 10000) / 100});
    }

    acceptedCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Session"]["Accepted"]});
    }
    
    rejectedCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Session"]["Rejected"]});
    }

    difficultyCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, ()=>{ return this.state.miners[rowIndex].summary.data["Session"]["Difficulty"]});
    }

    temperatureCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, () => {
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
            return maxTemp;
        });
    }

    powerCellRenderer = (rowIndex: number) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return this.errorCellRenderer(rowIndex, () => {
            let sumPower = 0;
            if (this.state.miners[rowIndex]){
                const hbs = this.state.miners[rowIndex].summary.data["HBs"];
                if (hbs.length > 0){
                    hbs.forEach(hb => {
                        sumPower += hb["Input Power"];
                    });
                }
            }

            return Math.round(sumPower);
        });
    }

    handleRemoveMiner(rowIndex){
        electron.ipcRenderer.send('remove-miners',
            [this.state.miners[rowIndex].ip]
        );
        const newMiners = this.state.miners.filter( (m, idx) => {return idx !== rowIndex});
        this.setState({miners: newMiners});
    }

    removeCellRenderer = (rowIndex) => {
        rowIndex = this.getNthVisibleMinerIndex(rowIndex);
        return (<Cell>
                 <Button className="embeddedTableButton" ><Icon icon="remove" onClick={() => {this.handleRemoveMiner(rowIndex)}} /> </Button>
               </Cell>);
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
        electron.ipcRenderer.removeListener('get-table-reply', this.tableGetterHandler); //right now will not run ever
    }

    getKeyFromColumnIndex(col){
        //find idx of col'd checked col

        let realCol = 0;
        let sum = 0;
        while (sum <= col) {
            if (!this.state.isChecked[this.state.colIdxToKey[realCol]]){
                realCol++;
            } else {
                realCol++;
                sum++;
            }
        }

        return this.state.colIdxToKey[realCol-1];
    }

    handleCopy(rowIndex: number, col: number){
        const key = this.getKeyFromColumnIndex(col);
        
        switch(key){
            case 'ip':
                return this.state.miners[rowIndex].ip;
            case 'name':
                return this.state.miners[rowIndex].summary.data["Hostname"];
            case 'firmware':
                return this.state.miners[rowIndex].summary.data["Software"];
            case 'operatingMode':
                return this.state.miners[rowIndex].summary.data["Preset"];
            case 'pool':
                return this.state.miners[rowIndex].summary.data["Stratum"]["Current Pool"];
            case 'user':
                return this.state.miners[rowIndex].summary.data["Stratum"]["Current User"];
            case 'started':
                return new Date(this.state.miners[rowIndex].summary.data["Session"]["Startup Timestamp"] * 1000).toString();
            case 'uptime':
                return this.secondsToHumanReadable(this.state.miners[rowIndex].summary.data["Session"]["Uptime"]);
            case 'activeHBs':
                return this.state.miners[rowIndex].summary.data["HBs"].length;
            case 'hashrate1hr':
                return 'todo';
                return Math.round(this.state.miners[rowIndex].summary.data["Session"]["Average MHs"] / 10000) / 100;
            case 'hashrate24hr':
                return 'todo';
                return Math.round(this.state.miners[rowIndex].summary.data["Session"]["Average MHs"] / 10000) / 100;
            case 'acceptedShares':
                return this.state.miners[rowIndex].summary.data["Session"]["Accepted"];
            case 'rejectedShares':
                return this.state.miners[rowIndex].summary.data["Session"]["Rejected"];
            case 'difficulty':
                return this.state.miners[rowIndex].summary.data["Session"]["Difficulty"];
            case 'temperature':
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
                return maxTemp;
            case 'power':
                let sumPower = 0;
                if (this.state.miners[rowIndex]){
                    const hbs = this.state.miners[rowIndex].summary.data["HBs"];
                    if (hbs.length > 0){
                        hbs.forEach(hb => {
                            sumPower += hb["Input Power"];
                        });
                    }
                }
                return Math.round(sumPower)
            default:
                console.log('bad copy paste key')
                return '';
        }

    }

    render() {

        let columns = [];

        this.state.colIdxToKey.forEach(key => {
            if (this.state.isChecked[key]) {
                columns.push(this.state.columns[key])
            }
        });

        return (
            <div className={"minersPageContainer " + (this.props.visible ? "" : "invisible")} >
                <div className="minersTableCategoriesContainer">
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.ip            } onChange={this.handleColumnVisibility.bind(this, 'ip')}>  IP </Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.name          } onChange={this.handleColumnVisibility.bind(this, 'name')}>  Name                </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.firmware      } onChange={this.handleColumnVisibility.bind(this, 'firmware')}>  Firmware            </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.operatingMode } onChange={this.handleColumnVisibility.bind(this, 'operatingMode')}>  Operating Mode      </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.pool          } onChange={this.handleColumnVisibility.bind(this, 'pool')}>  Pool                </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.user          } onChange={this.handleColumnVisibility.bind(this, 'user')}>  User                </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.startTime     } onChange={this.handleColumnVisibility.bind(this, 'started')}>  Start Time          </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.uptime        } onChange={this.handleColumnVisibility.bind(this, 'uptime')}>  Uptime              </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.activeHBs     } onChange={this.handleColumnVisibility.bind(this, 'activeHBs')}>  Active HBs          </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.hashrate1hr      } onChange={this.handleColumnVisibility.bind(this, 'hashrate1hr')}>  Hashrate 1hr           </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.hashrate24hr      } onChange={this.handleColumnVisibility.bind(this, 'hashrate24hr')}>  Hashrate 24hr           </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.acceptedShares} onChange={this.handleColumnVisibility.bind(this, 'acceptedShares')}>  Accepted Shares     </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.rejectedShares} onChange={this.handleColumnVisibility.bind(this, 'rejectedShares')}>  Rejected Shares     </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.difficulty    } onChange={this.handleColumnVisibility.bind(this, 'difficulty')}>  Difficulty          </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.temperature   } onChange={this.handleColumnVisibility.bind(this, 'temperature')}>  {"Temperature \u00b0C"} </ Checkbox>
                    <Checkbox inline={true} defaultChecked={this.state.isChecked.power         } onChange={this.handleColumnVisibility.bind(this, 'power')}>  Power               </ Checkbox>
                    <Tooltip content="Not including fan consumption" position={Position.BOTTOM_RIGHT}>
                        <Icon className="powerTip" icon="info-sign"/>
                    </Tooltip>
                    <Checkbox inline={true} default={this.state.isChecked.remove} onChange={this.handleColumnVisibility.bind(this, 'remove')}>Remove Miner Column</Checkbox>
                </div>
                <div className="minerSearchBarContainer">
                    <InputGroup
                        leftIcon="filter"
                        onChange={this.handleFilterChange}
                        placeholder="Filter table..."
                    />
                </div>
                <div className="minersTableContainer">
                    <Table getCellClipboardData={this.handleCopy}
                            className="minersTable"
                            enableRowHeader={false}
                            enableColumnReordering={true}
                            numRows={this.getVisibleMiners().length}
                            onColumnsReordered={this.handleColumnReordering}
                            onSelection={this.handleSelectionChange}    
                        >
                        {columns}
                    </Table>
                </div>
                <div className="newMinersFormContainer">
                    <h3>{"Add new miners"}</h3>
                    <InputGroup className="ipBox" placeholder="IP" onChange={this.handleNewMinerIpChange}/>  
                    <Button className="addMinerButton" icon="plus" text="Add Miner via IP" onClick={this.addNewMiner} />
                    <Button className="saveMinerButton" icon="floppy-disk" text="Save current miners" onClick={this.saveCurrentMiners} />
                    <Button className="loadMinerButton" icon="bring-data" text="Load previously added miners" onClick={this.loadPreviousMiners} />
                </div>
            </div>
        );
    }
}

export default TablePage;
