import * as React from 'react';
import { Cell, Column, Table } from '@blueprintjs/table';

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/table/lib/css/table.css";

export class TestTable extends React.Component {
    constructor(props) {
        super(props);
        this.renderCell = this.renderCell.bind(this);
    }

    renderCell(row) {
        return (
            <Cell>{row}</Cell>
        );
    };

    render() {
        return (
            <Table numRows={10}>
                <Column name="IP"/>
            </Table>
        );
    }
}