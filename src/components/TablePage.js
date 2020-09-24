import React from 'react'
import { Cell, Column, Table } from "@blueprintjs/table"
import { useSelector } from 'react-redux'
import { selectAllMiners } from '../features/miners/minersSlice'

import '@blueprintjs/table/lib/css/table.css'
import './TablePage.css'


const TablePage = (props) => {

    const miners = useSelector(selectAllMiners)
    const ipCellRenderer = (rowIndex: number) => {
        return <Cell>{miners[rowIndex].ip}</Cell>
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
