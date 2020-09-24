import React from 'react'
import { Cell, Column, Table } from "@blueprintjs/table"

import '@blueprintjs/table/lib/css/table.css'
import './TablePage.css'

class TablePage extends React.Component {
    // constructor(props){
    //     super(props);
    // }


    //numrows needs to be a function call or check store
    render () {
        return (
            <div className="settingsTableContainer">
                <Table numRows={2}>
                    <Column name="col 1"/>
                    <Column name="col 2"/>
                    <Column name="col 3"/>
                </Table>
            </div>
        );
    }
}

export default TablePage;
