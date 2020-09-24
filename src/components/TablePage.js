import React from 'react'
import { Cell, Column, Table } from "@blueprintjs/table"
import { useSelector } from 'react-redux'

import '@blueprintjs/table/lib/css/table.css'
import './TablePage.css'


const TablePage = (props) => {

    const miners = useSelector(state => state.miners);
    const ipCellRenderer = (rowIndex: number) => {
        return <Cell>{miners[rowIndex].ip + ':' + miners[rowIndex].port}</Cell>
    }

    return (
        <div className="settingsTableContainer">
            <Table enableRowHeader={false} numRows={miners.length}>
                <Column name="IP" cellRenderer={ipCellRenderer}/>
            </Table>
        </div>
    );
}

export default TablePage;
