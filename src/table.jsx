import * as React from 'react';
import { Cell, Column, Table } from '@blueprintjs/table';
import { Tabs, Tab } from '@blueprintjs/core';

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/table/lib/css/table.css";

import { DataGrid } from '@material-ui/data-grid';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'ip', headerName: 'IP', width: 130 },
    { field: 'hashrate15min', headerName: 'Hashrate (15min)', width: 150 }
];

export class DataTable extends React.Component {
    render() {
        const rows = this.props.data.map(
            (a, i) => ({id: i, ip: a.ip, hashrate15min: a.sum.Session['Average MHs']})
        );

        return (
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />
            </div>
        );
    }
}

export class TestTable extends React.Component {
    constructor(props) {
        super(props);
        this.renderCell = this.renderCell.bind(this);
        this.renderCell2 = this.renderCell2.bind(this);
    }

    renderCell(row) {
        return (
            <Cell>{this.props.data[row].ip}</Cell>
        );
    };

    renderCell2(row) {
        var sum = 0;
        try {
            for (let obj of this.props.data[row].hist.slice(-6)) {
                sum += obj.Hashrate;
            }
            sum /= 6;
        } catch(err) {
            console.log(err);
            sum = 'N/A'
        }
        
        return (
            <Cell>{sum}</Cell>
        );
    };

    render() {
        return (
            <div>
                <Table numRows={this.props.data.length} enableColumnReordering={true}>
                    <Column name="IP" cellRenderer={this.renderCell}/>
                    <Column name="History (6h)" cellRenderer={this.renderCell2}/>
                </Table>
                <Tabs>
                    <Tab id="miningpool" title="Mining Pool"/>
                    <Tab id="walletaddr" title="Wallet Address"/>
                </Tabs>
            </div>
        );
    }
}