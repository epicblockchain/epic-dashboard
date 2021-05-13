import * as React from 'react';
import {
    DataGrid,
    GridToolbarContainer,
    GridFilterToolbarButton,
    GridColumnsToolbarButton,
    GridDensitySelector } from '@material-ui/data-grid';
import { Tabs, Tab } from '@material-ui/core';

const columns = [
    { field: 'ip', headerName: 'IP', width: 120 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'hashrate15min', headerName: 'Hashrate (15min)', width: 180 },
    { field: 'hashrate6hr', headerName: 'Hashrate (6h)', width: 180 }
];

function Toolbar() {
    return(
        <GridToolbarContainer>
            <GridColumnsToolbarButton/>
            <GridFilterToolbarButton/>
            <GridDensitySelector/>
        </GridToolbarContainer>
    );
}

export class DataTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {selected: []};
    }

    hashrate6hr(row) {
        var sum = 0;
        try {
            for (let obj of this.props.data[row].hist.slice(-6)) {
                sum += obj.Hashrate;
            }
            sum /= 6;
        } catch {
            sum = 'N/A'
        }
        return sum;
    }

    select(model) {
        console.log('before set state', model);
        var temp = model;
        this.setState({selected: temp});
    }

    render() {
        const rows = this.props.data.map(
            (a, i) => ({
                id: i,
                ip: a.ip,
                name: a.sum.Hostname,
                hashrate15min: a.sum.Session['Average MHs'],
                hashrate6hr: this.hashrate6hr(i)
            })
        );

        return (
            <div style={{ height: 500, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} checkboxSelection
                    components={{Toolbar: Toolbar}}
                    selectionModel={this.selected}
                    onSelectionModelChange={sel => {
                        this.select(sel.selectionModel);
                        console.log(this.state.selected);
                    }}
                    /*onRowSelected={sel => {
                        this.select(sel.data.ip, sel.isSelected);
                    }}*/
                />
                <Tabs value={0}>
                    <Tab label="one" index={0}/>
                    <Tab label="two" index={1}/>
                </Tabs>
            </div>
        );
    }
}