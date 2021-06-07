import React from "react";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MuiCheckbox from "@material-ui/core/Checkbox";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import SvgIcon from "@material-ui/core/SvgIcon";
import TextField from "@material-ui/core/TextField";
import ViewWeekIcon from '@material-ui/icons/ViewWeek';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import FilterListIcon from '@material-ui/icons/FilterList';

import {
  useTable,
  useBlockLayout,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce
} from "react-table";
import { FixedSizeGrid } from "react-window";

import "./customTable.css";

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef();
        const resolvedRef = ref || defaultRef;

        React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
        }, [resolvedRef, indeterminate]);

        return (
            <MuiCheckbox
                color="primary"
                indeterminate={Boolean(indeterminate)}
                ref={resolvedRef}
                {...rest}
            />
        );
    }
);

function FilterIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
        </SvgIcon>
    );
}

function Table({ dataRaw, update, extstate, extmodel }) {
    const DefaultColumnFilter = React.useCallback(({column: { filterValue, preFilteredRows, setFilter }}) => {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        const [value, setValue] = React.useState(filterValue);

        const changeFilter = useAsyncDebounce(value => {
            setFilter(value || undefined);
        }, 300);
    
        return (
            <div>
                <IconButton onClick={handleClick} size="small" className="filter">
                    { !filterValue && <FilterListIcon fontSize="small"/> }
                    { filterValue && <FilterIcon fontSize="small" color="primary"/> }
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    transitionDuration={100}
                >
                    <TextField
                        value={value || ''}
                        onChange={e => {
                            setValue(e.target.value);
                            changeFilter(e.target.value);
                        }}
                        placeholder={'Filter...'}
                        variant="outlined"
                        size="small"
                        color="primary"
                    />
                </Menu>
            </div>
        )
    });

    const defaultColumn = React.useMemo(
        () => ({
            minWidth: 50,
            width: 150,
            maxWidth: 500,
            Filter: DefaultColumnFilter
        }),
        []
    );

    const data = React.useMemo(() => dataRaw, [dataRaw]);
    const columns = React.useMemo(() => [
        { accessor: 'ip', Header: 'IP', width: 130 },
        { accessor: 'name', Header: 'Name', width: 150 },
        { accessor: 'firmware', Header: 'Firmware', width: 150 },
        { accessor: 'model', Header: 'Model', width: 100},
        { accessor: 'mode', Header: 'Mode', width: 100 },
        { accessor: 'pool', Header: 'Pool', width: 180 },
        { accessor: 'user', Header: 'User', width: 180 },
        { accessor: 'start', Header: 'Started', width: 260 },
        { accessor: 'uptime', Header: 'Uptime', width: 135 },
        { accessor: 'hbs', Header: 'Active HBs', width: 120},
        { accessor: 'hashrate15min', Header: 'Hashrate (15min)', width: 150},
        { accessor: 'hashrate1hr', Header: 'Hashrate (1h)', width: 150}, 
        { accessor: 'hashrate6hr', Header: 'Hashrate (6h)', width: 150},
        { accessor: 'hashrate24hr', Header: 'Hashrate (24h)', width: 150},
        { accessor: 'accepted', Header: 'Accepted Shares', width: 150},
        { accessor: 'rejected', Header: 'Rejected Shares', width: 150},
        { accessor: 'difficulty', Header: 'Difficulty', width: 120},
        { accessor: 'temperature', Header: 'Temp \u00b0C', width: 110 },
        { accessor: 'power', Header: 'Power (W)', width: 110}
    ], []);

    const model = React.useMemo(() => extmodel, []);
    const initialState = React.useMemo(() => extstate, []);
    const updateState = React.useCallback((a, b, c, data, model) => update(a, b, c, data, model));

    const getTextWidth = React.useCallback((input, context) => {
        return Math.ceil(context.measureText(input).width);
    });

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        dispatch,
        allColumns,
        totalColumnsWidth,
        getToggleHideAllColumnsProps,
        state,
        selectedFlatRows,
        toggleHideColumn,
        toggleHideAllColumns,
        preGlobalFilteredRows,
        setGlobalFilter
    } = useTable(
    {
        columns,
        data,
        initialState,
        defaultColumn,
        autoResetSelectedRows: false,
        autoResetSortBy: false,
        autoResetFilters: false,
        autoResetGlobalFilter: false,
        stateReducer: (a, b, c) => {
            //console.log('stateChange', b);
            switch(b.type) {
                case 'autoColSize':
                    const clone = a.columnResizing;
                    clone.columnWidths[b.col] = b.val;

                    return {
                        ...a,
                        columnResizing: clone
                    };
            }

            if (b.type !='columnResizing' && b.type !='columnStartResizing') {
                updateState(a, b, c, dataRaw, model);
            }
        }
    },
    useBlockLayout,
    useResizeColumns,
    useFilters,
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks) => {
        hooks.visibleColumns.push((columns) => [
            {
                id: "selection",
                width: 50,
                disableResizing: true,
                disableFilters: true,
                Header: ({ getToggleAllRowsSelectedProps }) => (
                    <div className="check-wrap">
                        <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                    </div>
                ),
                Cell: ({ row }) => (
                    <div className="check-wrap">
                        <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                    </div>
                )
            },
            ...columns
        ]);
    }
  );

    const scroll = React.useCallback((obj) => {
        document.getElementById('header').style.transform = `translateX(${-obj.scrollLeft}px)`;
    });

  const RenderRow = React.useCallback(
    ({ columnIndex, rowIndex, style }) => {
        const row = rows[rowIndex];
        prepareRow(row);
        return (
            <TableRow
                {...row.getRowProps({
                    style
                })}
                component="div"
                className={state.selectedRowIds[rowIndex] ? "Mui-selected" : ""}
            >
                {row.cells.map((cell) => {
                    return (
                        <TableCell {...cell.getCellProps()} component="div">
                            {cell.render("Cell")}
                        </TableCell>
                    );
                })}
            </TableRow>
        );
    },
    [prepareRow, rows, state.selectedRowIds, window.innerWidth]
  );

  return (
    <React.Fragment>
        <div className="toolbar">
            <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                startIcon={<ViewWeekIcon/>}
                color="primary"
                size="small"
                onClick={handleClick}
            >
                Columns
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transitionDuration={100}
            >
                <MenuItem onClick={() => toggleHideAllColumns()}>
                    <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} />
                    Show/Hide All
                </MenuItem>
                {allColumns.map((col) => {
                    return col.id != "selection" ? (
                        <MenuItem key={col.id} onClick={() => toggleHideColumn(col.id)}>
                            <IndeterminateCheckbox {...col.getToggleHiddenProps()} />
                            {col.Header}
                        </MenuItem>
                    ) : null;
                })}
            </Menu>
        </div>
        <MaUTable {...getTableProps()} component="div" id="datatable">
            <TableHead component="div" id="header">
                {headerGroups.map((headerGroup) => (
                    <TableRow {...headerGroup.getHeaderGroupProps()} component="div">
                        {headerGroup.headers.map((column) => (
                            <TableCell {...column.getHeaderProps()} component="div">
                                <div {...column.getSortByToggleProps()} className={column.id != "selection" ? "col-header" : ""}>
                                    {column.render("Header")}
                                    <span className="sort-icon">
                                        {column.isSorted
                                            ? column.isSortedDesc
                                            ? <ArrowDownwardIcon fontSize="small"/>
                                            : <ArrowUpwardIcon fontSize="small"/>
                                            : ''}
                                    </span>
                                </div>
                                { column.canFilter ? column.render('Filter') : null }
                                <div
                                    {...(column.canResize ? column.getResizerProps() : [])}
                                    className={`resizer ${ column.isResizing ? "isResizing" : "" }`}
                                    onDoubleClick={() => {
                                        if (column.id != "selection") {
                                            let max = 0;

                                            const context = document.getElementById('canvas').getContext('2d');
                                            context.font = '14px Helvetica';

                                            data.forEach((row) => {
                                                const width = getTextWidth(row[column.id], context);
                                                if (width > max) max = width;
                                            });
                                            
                                            dispatch({
                                                type: 'autoColSize',
                                                col: column.id, 
                                                val: Math.max(max, getTextWidth(column.Header, context)) + 48
                                            });
                                        }
                                    }}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>
            
            <TableBody {...getTableBodyProps()} component="div" id="list-wrapper">
                <FixedSizeGrid
                    height={380}
                    rowHeight={32}
                    rowCount={rows.length}
                    columnCount={1}
                    columnWidth={totalColumnsWidth + 24}
                    width={window.innerWidth - 18}
                    onScroll={scroll}
                    style={{maxWidth: 1400}}
                >
                    {RenderRow}
                </FixedSizeGrid>
            </TableBody>
        </MaUTable>
    </React.Fragment>
  );
}

export default Table;