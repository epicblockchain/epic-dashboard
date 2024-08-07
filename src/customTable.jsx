import React from 'react';
import MaUTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import MuiCheckbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LightOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {
    useTable,
    useBlockLayout,
    useResizeColumns,
    useRowSelect,
    useSortBy,
    useFilters,
    useAsyncDebounce,
} from 'react-table';
import {FixedSizeGrid} from 'react-window';

import './customTable.css';

const {ipcRenderer} = require('electron');

const IndeterminateCheckbox = React.forwardRef(({indeterminate, ...rest}, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <MuiCheckbox color="primary" indeterminate={Boolean(indeterminate)} ref={resolvedRef} {...rest} />;
});

function FilterIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z" />
        </SvgIcon>
    );
}

function hashrateSort(a, b, c, d) {
    let a_split = a.values[c].split(' ');
    let b_split = b.values[c].split(' ');
    if (a_split[1] === b_split[1] && a.values[c] !== 'N/A') {
        if (parseFloat(a_split[0]) > parseFloat(b_split[0])) return 1;
        return -1;
    } else if (a_split[1] === 'TH/s') {
        return 1;
    } else if (a_split[1] === 'GH/s') {
        if (b_split[1] === 'TH/s') return -1;
        return 1;
    } else if (a_split[1] === 'MH/s') {
        if (b.values[c] === 'N/A') return 1;
        return -1;
    } else if (a.values[c] === 'N/A') {
        return -1;
    }
}

function getColor(lowest) {
    if (lowest < 95) {
        return 'error.main';
    } else if (lowest < 97) {
        return 'warning.main';
    } else {
        return 'success.main';
    }
}

function getColorText(lowest) {
    if (lowest < 95) {
        return 'text.error';
    } else if (lowest < 97) {
        return 'text.success';
    } else {
        return 'text.success';
    }
}

function Table({dataRaw, update, extstate, extmodel, reset, drawerOpen, clear, handleApi}) {
    const DefaultColumnFilter = React.useCallback(({column: {filterValue, preFilteredRows, setFilter}}) => {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        const [value, setValue] = React.useState(filterValue);

        const changeFilter = useAsyncDebounce((value) => {
            setFilter(value || undefined);
        }, 300);

        return (
            <div>
                <IconButton onClick={handleClick} size="small" className="filter">
                    {!filterValue && <FilterListIcon fontSize="small" />}
                    {filterValue && <FilterIcon fontSize="small" color="primary" />}
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
                        onChange={(e) => {
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
        );
    });

    const defaultColumn = React.useMemo(
        () => ({
            minWidth: 50,
            width: 150,
            maxWidth: 500,
            Filter: DefaultColumnFilter,
        }),
        []
    );

    const data = React.useMemo(() => dataRaw, [dataRaw]);
    const columns = React.useMemo(
        () => [
            {accessor: 'status', Header: 'Status', width: 110},
            {accessor: 'ip', Header: 'IP', width: 150},
            {accessor: 'name', Header: 'Name', width: 150},
            {accessor: 'firmware', Header: 'Firmware', width: 108},
            {accessor: 'model', Header: 'Model', width: 150},
            {accessor: 'mode', Header: 'Mode', width: 150},
            {accessor: 'pool', Header: 'Pool', width: 180},
            {accessor: 'user', Header: 'User', width: 210, maxWidth: 700},
            {accessor: 'start', Header: 'Started', width: 150},
            {accessor: 'uptime', Header: 'Uptime', width: 135},
            {accessor: 'hbs', Header: 'Active HBs', width: 118},
            {accessor: 'perpetualtune', Header: 'Perpetual Tune', width: 150},
            {accessor: 'perpetualtunealgo', Header: 'Perpetual Tune Algorithm', width: 225},
            {accessor: 'perpetualtuneoptimized', Header: 'Perpetual Tune Optimized', width: 225},
            {accessor: 'perpetualtunetarget', Header: 'Perpetual Tune Target', width: 200},
            {accessor: 'perpetualtuneminthrottle', Header: 'Perpetual Tune Min Throttle', width: 225},
            {accessor: 'perpetualtunethrottlestep', Header: 'Perpetual Tune Throttle Step', width: 225},
            {accessor: 'shutdowntemp', Header: 'Shutdown Temperature', width: 170},
            {accessor: 'criticaltemp', Header: 'Critical Temperature', width: 170},
            {accessor: 'performance', Header: 'Hashboard Performance', width: 250},
            {accessor: 'realtimehashrate', Header: 'Realtime Hashrate', width: 200},
            {accessor: 'hashrate15min', Header: 'Hashrate (15min)', width: 150, sortType: hashrateSort},
            {accessor: 'hashrate1hr', Header: 'Hashrate (1h)', width: 150, sortType: hashrateSort},
            {accessor: 'hashrate6hr', Header: 'Hashrate (6h)', width: 150, sortType: hashrateSort},
            {accessor: 'hashrate24hr', Header: 'Hashrate (24h)', width: 150, sortType: hashrateSort},
            {accessor: 'efficiency1hr', Header: 'Efficiency (1h)', width: 140, sortType: 'number'},
            {accessor: 'accepted', Header: 'Accepted Shares', width: 150},
            {accessor: 'rejected', Header: 'Rejected Shares', width: 150},
            {accessor: 'difficulty', Header: 'Difficulty', width: 120},
            {accessor: 'temperature', Header: 'Temp', width: 84},
            {accessor: 'power', Header: 'Power (W)', width: 110},
            {accessor: 'fanspeed', Header: 'Fan Speed', width: 115},
            {accessor: 'voltage', Header: 'Input Voltage', width: 100, sortType: 'number'},
            {accessor: 'clock', Header: 'Avg Clock', width: 210},
            {accessor: 'fansrpm', Header: 'Fans Rpm', width: 370},
            {accessor: 'lasterror', Header: 'Last Error', width: 250},
            {accessor: 'mac', Header: 'MAC Address', width: 250},
        ],
        []
    );

    const model = React.useMemo(() => extmodel, []);
    const initialState = React.useMemo(() => extstate, []);
    const updateState = React.useCallback((a, b, c, data, model) => update(a, b, c, data, model), []);
    const resetSelected = React.useMemo(() => reset, [reset]);
    const drawer = React.useMemo(() => drawerOpen, [drawerOpen]);

    const getTextWidth = React.useCallback((input, context) => {
        return Math.ceil(context.measureText(input).width);
    }, []);

    // Memoized clear miners from undefined tab
    const clearM = React.useCallback(() => clear(), []);
    // Memoized handleApi
    const handleApiM = React.useCallback((api, data, selected) => handleApi(api, data, selected), []);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

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
    } = useTable(
        {
            columns,
            data,
            initialState,
            defaultColumn,
            autoResetSelectedRows: resetSelected,
            autoResetSortBy: false,
            autoResetFilters: false,
            stateReducer: (a, b, c) => {
                switch (b.type) {
                    case 'autoColSize':
                        const clone = Object.assign({}, a.columnResizing);
                        clone.columnWidths[b.col] = b.val;

                        return {
                            ...a,
                            columnResizing: clone,
                        };
                }

                if (b.type != 'columnResizing' && b.type != 'columnStartResizing') {
                    updateState(a, b, c, dataRaw, model);
                }
            },
        },
        useBlockLayout,
        useResizeColumns,
        useFilters,
        useSortBy,
        useRowSelect,
        (hooks) => {
            hooks.visibleColumns.push((columns) => [
                {
                    id: 'selection',
                    width: 50,
                    disableResizing: true,
                    disableFilters: true,
                    Header: ({getToggleAllRowsSelectedProps}) => (
                        <div className="check-wrap">
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    Cell: ({row}) => (
                        <div className="check-wrap">
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ]);
        }
    );

    const scroll = React.useCallback((obj) => {
        document.getElementById('header').style.transform = `translateX(${-obj.scrollLeft}px)`;
    }, []);

    const resizeCol = React.useCallback(
        (e) => {
            const {id, header} = JSON.parse(e.target.getAttribute('data-value'));

            if (id != 'selection') {
                let max = 0;

                const context = document.getElementById('canvas').getContext('2d');
                context.font = '14px Helvetica';

                data.forEach((row) => {
                    let width = getTextWidth(row[id], context);
                    if (id === 'ip') width += 17;
                    if (width > max) max = width;
                });

                dispatch({
                    type: 'autoColSize',
                    col: id,
                    val: Math.max(max + 22, getTextWidth(header, context) + 48),
                });
            }
        },
        [data]
    );

    const RenderRow = React.useCallback(
        ({columnIndex, rowIndex, style}) => {
            const row = rows[rowIndex];
            const led = data[row.id].misc ? data[row.id].misc['Locate Miner State'] : null;
            prepareRow(row);
            return (
                <TableRow
                    {...row.getRowProps({
                        style,
                    })}
                    component="div"
                    className={row.getToggleRowSelectedProps().checked ? 'Mui-selected' : ''}
                >
                    {row.cells.map((cell) => {
                        return (
                            <TableCell
                                {...cell.getCellProps()}
                                component="div"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    color: cell.column
                                        ? cell.column.id === 'hbs'
                                            ? cell.value === 3
                                                ? 'text.success'
                                                : 'text.error'
                                            : cell.column.id === 'performance'
                                            ? cell.value == 'N/A' || cell.value == 'Error'
                                                ? 'text.error'
                                                : getColorText(data[row.id].lowest)
                                            : cell.column.id === 'voltage'
                                            ? cell.value <= 11.9
                                                ? 'text.error'
                                                : null
                                            : cell.column.id === 'lasterror'
                                            ? cell.value !== ' '
                                                ? 'text.error'
                                                : null
                                            : cell.column.id === 'ip'
                                            ? 'ip-col'
                                            : cell.column.id === 'status'
                                            ? data[row.id].lasterror !== ' '
                                                ? data[row.id].status
                                                    ? 'text.error'
                                                    : null
                                                : null
                                            : cell.column.id === 'pool'
                                            ? data[row.id].connected !== 'Error'
                                                ? data[row.id].connected
                                                    ? 'text.success'
                                                    : 'text.error'
                                                : null
                                            : null
                                        : null,
                                    backgroundColor: cell.column
                                        ? cell.column.id === 'hbs'
                                            ? cell.value === 3
                                                ? 'success.main'
                                                : 'error.main'
                                            : cell.column.id === 'performance'
                                            ? cell.value == 'N/A' || cell.value == 'Error'
                                                ? 'error.main'
                                                : getColor(data[row.id].lowest)
                                            : cell.column.id === 'voltage'
                                            ? cell.value <= 11.9
                                                ? 'error.main'
                                                : null
                                            : cell.column.id === 'lasterror'
                                            ? cell.value !== ' '
                                                ? 'error.main'
                                                : null
                                            : cell.column.id === 'ip'
                                            ? 'ip-col'
                                            : cell.column.id === 'status'
                                            ? data[row.id].lasterror !== ' '
                                                ? data[row.id].status
                                                    ? 'error.main'
                                                    : null
                                                : null
                                            : cell.column.id === 'pool'
                                            ? data[row.id].connected !== 'Error'
                                                ? data[row.id].connected
                                                    ? 'success.main'
                                                    : 'error.main'
                                                : 'error.main'
                                            : null
                                        : null,
                                }}
                                className={cell.column.id === 'ip' && 'ip-col'}
                            >
                                {cell.column.id === 'ip' && (
                                    <>
                                        {/* {console.log(data[row.id])} */}
                                        <IconButton
                                            className="led-toggle"
                                            size="small"
                                            disabled={!data[row.id].misc || data[row.id].name === 'Error'}
                                            title={led ? 'Toggle LED Off' : 'Toggle LED On'}
                                            onClick={() =>
                                                handleApiM('/identify', {checked: !led, password: ''}, [
                                                    data[row.id].id,
                                                ])
                                            }
                                        >
                                            <LightOutlinedIcon className={led ? 'led-on' : ''} />
                                        </IconButton>
                                        <IconButton
                                            className="open-browser"
                                            size="small"
                                            onClick={() =>
                                                ipcRenderer.invoke('open-external', `http://${data[row.id].ip}`)
                                            }
                                        >
                                            <OpenInNewIcon />
                                        </IconButton>
                                    </>
                                )}
                                <div style={{whiteSpace: 'pre'}}>{cell.render('Cell')}</div>
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
                    startIcon={<ViewWeekIcon />}
                    color="primary"
                    size="small"
                    ref={anchorRef}
                    onClick={handleToggle}
                >
                    Columns
                </Button>
                {clear && (
                    <Button
                        startIcon={<DeleteSweepIcon />}
                        color="primary"
                        size="small"
                        disabled={!rows.length}
                        onClick={clearM}
                    >
                        Clear Miners
                    </Button>
                )}
                {model !== 'undefined' && (
                    <>
                        <Button
                            startIcon={<LightOutlinedIcon />}
                            color="primary"
                            size="small"
                            title="LEDs on for selected"
                            disabled={!selectedFlatRows.length}
                            onClick={() => {
                                handleApiM(
                                    '/identify',
                                    {checked: true, password: ''},
                                    Object.keys(state.selectedRowIds).map((id) => data[id].id)
                                );
                            }}
                        >
                            LED On
                        </Button>
                        <Button
                            startIcon={<HighlightOffIcon />}
                            color="primary"
                            size="small"
                            title="LEDs off for selected"
                            disabled={!selectedFlatRows.length}
                            onClick={() => {
                                handleApiM(
                                    '/identify',
                                    {checked: false, password: ''},
                                    Object.keys(state.selectedRowIds).map((id) => data[id].id)
                                );
                            }}
                        >
                            LED Off
                        </Button>
                    </>
                )}
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    placement="bottom-start"
                    transition
                    disablePortal
                    style={{zIndex: 1000}}
                >
                    {({TransitionProps}) => (
                        <Grow {...TransitionProps} {...{timeout: 100}}>
                            <Paper elevation={8}>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList autoFocusItem={open} id="simple-menu">
                                        <MenuItem onClick={() => toggleHideAllColumns()}>
                                            <IndeterminateCheckbox
                                                {...getToggleHideAllColumnsProps()}
                                                onChange={null}
                                            />
                                            Show/Hide All
                                        </MenuItem>
                                        {allColumns.map((col) => {
                                            return col.id != 'selection' ? (
                                                <MenuItem key={col.id} onClick={() => toggleHideColumn(col.id)}>
                                                    <IndeterminateCheckbox
                                                        {...col.getToggleHiddenProps()}
                                                        onChange={null}
                                                    />
                                                    {col.Header}
                                                </MenuItem>
                                            ) : null;
                                        })}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
            <MaUTable {...getTableProps()} component="div" id="datatable">
                <TableHead component="div" id="header">
                    {headerGroups.map((headerGroup) => (
                        <TableRow {...headerGroup.getHeaderGroupProps()} component="div">
                            {headerGroup.headers.map((column) => (
                                <TableCell {...column.getHeaderProps()} component="div">
                                    <div {...column.getSortByToggleProps()} className="header-wrapper">
                                        <div className={column.id != 'selection' ? 'col-header' : ''}>
                                            {column.render('Header')}
                                        </div>
                                        {column.isSorted ? (
                                            column.isSortedDesc ? (
                                                <ArrowDownwardIcon fontSize="small" />
                                            ) : (
                                                <ArrowUpwardIcon fontSize="small" />
                                            )
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    {column.canFilter ? column.render('Filter') : null}
                                    <div
                                        {...(column.canResize ? column.getResizerProps() : [])}
                                        className={`resizer${column.isResizing ? ' isResizing' : ''}`}
                                        title="Drag to resize or double-click to autosize"
                                        data-value={JSON.stringify({id: column.id, header: column.Header})}
                                        onDoubleClick={resizeCol}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>

                <TableBody {...getTableBodyProps()} component="div">
                    <FixedSizeGrid
                        height={380}
                        rowHeight={32}
                        rowCount={rows.length}
                        columnCount={1}
                        columnWidth={totalColumnsWidth + 8}
                        width={document.getElementById('width').offsetWidth - (drawer ? 216 : 59)}
                        onScroll={scroll}
                        className="grid"
                    >
                        {RenderRow}
                    </FixedSizeGrid>
                </TableBody>
            </MaUTable>
            <TableFooter component="div">
                {selectedFlatRows.length > 0 && (
                    <span>
                        {selectedFlatRows.length} row{selectedFlatRows.length > 1 ? 's' : ''} selected
                    </span>
                )}
                <span style={{float: 'right'}}>Total Rows: {rows.length}</span>
            </TableFooter>
        </React.Fragment>
    );
}

export default Table;
