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
import Tooltip from '@mui/material/Tooltip';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import InfoIcon from '@mui/icons-material/Info';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LightOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {useTable, flexRender, functionalUpdate} from '@tanstack/react-table';
import {
    minerColumns,
    minerDefaultColumn,
    minerTableFeatures,
    tableColumnIds,
    getColumnVisibility,
    getTablePreferences,
    getRangeSelection,
    moveColumnOrder,
} from './minerTable.mjs';
export {tableColumnIds} from './minerTable.mjs';
import {FixedSizeGrid} from 'react-window';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {restrictToHorizontalAxis} from '@dnd-kit/modifiers';

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

function renderTooltipCell(value) {
    return value.tooltip ? (
        <Tooltip title={value.tooltip}>
            <span style={{display: 'flex', alignItems: 'center'}}>
                {value.value}
                <InfoIcon fontSize="small" style={{marginLeft: 4}} />
            </span>
        </Tooltip>
    ) : (
        value.value
    );
}

function isSameOrder(a = [], b = []) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}

export const tableColumns = minerColumns.map((column) =>
    column.accessorKey === 'perpetualtunetarget'
        ? {...column, cell: ({getValue}) => renderTooltipCell(getValue())}
        : column,
);

function getColumnClassName(columnId) {
    if (columnId == 'selection') {
        return 'selection-col';
    }

    if (columnId == 'ip') {
        return 'ip-col';
    }

    return '';
}

function ColumnDragHandle({columnId}) {
    const {attributes, listeners, setNodeRef} = useDraggable({id: columnId});

    return (
        <IconButton
            ref={setNodeRef}
            size="small"
            className="move-column"
            title="Drag to move column"
            onClick={(event) => event.stopPropagation()}
            {...attributes}
            {...listeners}
        >
            <SwapHorizIcon fontSize="small" />
        </IconButton>
    );
}

function ColumnHeaderCell({header, draggedColumnId, resizeCol}) {
    const {column} = header;
    const isSelectionColumn = column.id === 'selection';
    const {setNodeRef, isOver} = useDroppable({id: column.id, disabled: isSelectionColumn});
    const sorted = column.getIsSorted();
    const className = `${getColumnClassName(column.id)}${draggedColumnId === column.id ? ' column-drag-source' : ''}${
        isOver && draggedColumnId && draggedColumnId !== column.id ? ' column-drag-target' : ''
    }`.trim();

    return (
        <TableCell
            ref={setNodeRef}
            className={className}
            component="div"
            role="columnheader"
            aria-sort={sorted ? (sorted === 'desc' ? 'descending' : 'ascending') : undefined}
            style={{position: 'relative', flex: `0 0 ${header.getSize()}px`, width: header.getSize()}}
        >
            <div
                onClick={column.getToggleSortingHandler()}
                className="header-wrapper"
                style={{cursor: column.getCanSort() ? 'pointer' : undefined}}
            >
                <div className={!isSelectionColumn ? 'col-header' : ''}>
                    {flexRender(column.columnDef.header, header.getContext())}
                </div>
                {sorted &&
                    (sorted === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />)}
            </div>
            {!isSelectionColumn && <ColumnDragHandle columnId={column.id} />}
            {column.getCanFilter() && <DefaultColumnFilter column={column} />}
            {column.getCanResize() && (
                <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`resizer${column.getIsResizing() ? ' isResizing' : ''}`}
                    title="Drag to resize or double-click to autosize"
                    data-value={JSON.stringify({id: column.id, header: column.columnDef.header})}
                    onDoubleClick={resizeCol}
                />
            )}
        </TableCell>
    );
}

function ColumnDragPreview({column}) {
    if (!column) {
        return null;
    }

    return (
        <div className={`column-drag-overlay ${getColumnClassName(column.id)}`.trim()}>
            <div className="header-wrapper">
                <div className="col-header">{column.columnDef.header}</div>
            </div>
        </div>
    );
}

function DefaultColumnFilter({column}) {
    const filterValue = column.getFilterValue();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [value, setValue] = React.useState(filterValue || '');
    const timerRef = React.useRef();
    React.useEffect(() => {
        setValue(filterValue || '');
    }, [filterValue]);
    React.useEffect(() => () => clearTimeout(timerRef.current), []);
    return (
        <div>
            <IconButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                size="small"
                className="filter"
                title={`Filter ${column.columnDef.header}`}
            >
                {filterValue ? <FilterIcon fontSize="small" color="primary" /> : <FilterListIcon fontSize="small" />}
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transitionDuration={100}
            >
                <TextField
                    value={value}
                    onChange={(event) => {
                        const nextValue = event.target.value;
                        setValue(nextValue);
                        clearTimeout(timerRef.current);
                        timerRef.current = setTimeout(() => column.setFilterValue(nextValue || undefined), 300);
                    }}
                    placeholder="Filter..."
                    variant="outlined"
                    size="small"
                    color="primary"
                />
            </Menu>
        </div>
    );
}

function Table({dataRaw, update, extstate, extmodel, reset, drawerOpen, clear, handleApi}) {
    const data = dataRaw;
    const model = extmodel;
    const drawer = drawerOpen;
    const getTextWidth = React.useCallback((input, context) => Math.ceil(context.measureText(input).width), []);
    const clearM = React.useCallback(() => clear(), [clear]);
    const handleApiM = React.useCallback((api, data, selected) => handleApi(api, data, selected), [handleApi]);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const selectionStateRef = React.useRef({
        anchorRowId: null,
        baseSelectedRowIds: null,
        rangeMode: null,
        rows: [],
        selectedRowIds: {},
        shiftPressed: false,
    });
    const [draggedColumnId, setDraggedColumnId] = React.useState(null);
    const [previewColumnOrder, setPreviewColumnOrder] = React.useState(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
    );
    const resetSelectionSession = React.useCallback((anchorRowId = null) => {
        selectionStateRef.current.anchorRowId = anchorRowId;
        selectionStateRef.current.baseSelectedRowIds = null;
        selectionStateRef.current.rangeMode = null;
        selectionStateRef.current.shiftPressed = false;
    }, []);
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

    const [localState, setLocalState] = React.useState(() => ({
        sorting: extstate?.sorting || [],
        columnFilters: extstate?.columnFilters || [],
        columnSizing: extstate?.columnSizing || {},
        rowSelection: extstate?.rowSelection || {},
    }));
    const state = {
        ...localState,
        columnVisibility: getColumnVisibility(extstate?.hiddenColumns),
        columnOrder: ['selection', ...(previewColumnOrder || extstate?.columnOrder || [])],
    };
    const stateRef = React.useRef(state);
    stateRef.current = state;
    const changeState = React.useCallback(
        (key, updater, type = 'tableState') => {
            const previous = stateRef.current;
            const next = {...previous, [key]: functionalUpdate(updater, previous[key])};
            stateRef.current = next;
            setLocalState(next);
            update({...next, ...getTablePreferences(next)}, {type}, previous, dataRaw, extmodel);
        },
        [dataRaw, update, extmodel],
    );

    const columns = React.useMemo(
        () => [
            {
                id: 'selection',
                size: 50,
                minSize: 50,
                maxSize: 50,
                enableResizing: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableHiding: false,
                header: ({table}) => (
                    <div className="check-wrap">
                        <IndeterminateCheckbox
                            checked={table.getIsAllRowsSelected()}
                            indeterminate={table.getIsSomeRowsSelected()}
                            inputProps={{'aria-label': 'Select all miners'}}
                            onChange={(event) => {
                                resetSelectionSession();
                                table.toggleAllRowsSelected(event.target.checked);
                            }}
                        />
                    </div>
                ),
                cell: ({row}) => (
                    <div className="check-wrap">
                        <IndeterminateCheckbox
                            checked={row.getIsSelected()}
                            inputProps={{'aria-label': `Select miner ${row.original.ip}`}}
                            onMouseDown={(event) => {
                                selectionStateRef.current.shiftPressed = event.shiftKey;
                            }}
                            onChange={(event) => handleRowSelectionChange(event, row)}
                        />
                    </div>
                ),
            },
            ...tableColumns,
        ],
        [],
    );
    const table = useTable({
        features: minerTableFeatures,
        columns,
        data,
        defaultColumn: minerDefaultColumn,
        state,
        columnResizeMode: 'onChange',
        onSortingChange: (updater) => changeState('sorting', updater),
        onColumnFiltersChange: (updater) => changeState('columnFilters', updater),
        onColumnSizingChange: (updater) => changeState('columnSizing', updater),
        onRowSelectionChange: (updater) => changeState('rowSelection', updater, 'rowSelection'),
        onColumnOrderChange: (updater) => changeState('columnOrder', updater, 'setColumnOrder'),
        onColumnVisibilityChange: (updater) => changeState('columnVisibility', updater, 'toggleHideColumn'),
    });
    const rows = table.getRowModel().rows;
    const headerGroups = table.getHeaderGroups();
    const allColumns = table.getAllLeafColumns();
    const totalColumnsWidth = table.getTotalSize();
    const selectedFlatRows = table.getFilteredSelectedRowModel().flatRows;
    const setColumnOrder = table.setColumnOrder;
    React.useEffect(() => {
        if (reset) {
            table.setRowSelection({});
            resetSelectionSession();
        }
    }, [reset, resetSelectionSession, table.setRowSelection]);

    const tablePreferredHeight = Math.round(window.innerHeight * 0.52);
    const tableMaxViewportHeight = Math.max(180, window.innerHeight - 360);
    const tableViewportHeight = Math.max(180, Math.min(tablePreferredHeight, tableMaxViewportHeight));

    selectionStateRef.current.rows = rows;
    selectionStateRef.current.selectedRowIds = state.rowSelection || {};

    const currentColumnOrder = React.useMemo(
        () =>
            state.columnOrder && state.columnOrder.length
                ? state.columnOrder
                      .filter((id) => id !== 'selection')
                      .concat(tableColumnIds.filter((columnId) => !state.columnOrder.includes(columnId)))
                : tableColumnIds,
        [state.columnOrder],
    );

    const visibleColumnIds = React.useMemo(
        () => headerGroups[0]?.headers.filter((column) => column.id != 'selection').map((column) => column.id) || [],
        [headerGroups],
    );

    const draggedColumn = React.useMemo(
        () => headerGroups[0]?.headers.find((header) => header.column.id === draggedColumnId)?.column || null,
        [draggedColumnId, headerGroups],
    );

    const buildMovedColumnOrder = React.useCallback(
        (columnId, targetColumnId) => {
            return moveColumnOrder(currentColumnOrder, visibleColumnIds, columnId, targetColumnId);
        },
        [currentColumnOrder, visibleColumnIds],
    );

    React.useEffect(() => {
        if (previewColumnOrder && isSameOrder(previewColumnOrder, extstate?.columnOrder || [])) {
            setPreviewColumnOrder(null);
        }
    }, [extstate, previewColumnOrder]);

    React.useEffect(() => {
        if (!Object.keys(state.rowSelection || {}).length) {
            resetSelectionSession();
        }
    }, [resetSelectionSession, state.rowSelection]);

    const handleRowSelectionChange = React.useCallback(
        (event, row) => {
            const session = selectionStateRef.current;
            const shiftPressed = session.shiftPressed || event.shiftKey || event.nativeEvent?.shiftKey;
            session.shiftPressed = false;
            const base = session.baseSelectedRowIds || {...session.selectedRowIds};
            const shouldSelect = session.rangeMode !== null ? session.rangeMode : event.target.checked;
            const range =
                shiftPressed && session.anchorRowId !== null
                    ? getRangeSelection(session.rows, session.anchorRowId, row.id, base, shouldSelect)
                    : null;
            if (range) {
                session.baseSelectedRowIds = base;
                session.rangeMode = shouldSelect;
                table.setRowSelection(range);
            } else {
                row.toggleSelected(event.target.checked);
                resetSelectionSession(row.id);
            }
        },
        [table.setRowSelection, resetSelectionSession],
    );

    const handleColumnDragStart = React.useCallback(({active}) => {
        setDraggedColumnId(String(active.id));
    }, []);

    const handleColumnDragOver = React.useCallback(
        ({active, over}) => {
            const columnId = active?.id ? String(active.id) : null;
            const targetColumnId = over?.id ? String(over.id) : null;

            if (!columnId || !targetColumnId || columnId === targetColumnId) {
                return;
            }

            const nextColumnOrder = buildMovedColumnOrder(columnId, targetColumnId);

            if (nextColumnOrder && !isSameOrder(previewColumnOrder || currentColumnOrder, nextColumnOrder)) {
                setPreviewColumnOrder(nextColumnOrder);
            }
        },
        [buildMovedColumnOrder, currentColumnOrder, previewColumnOrder],
    );

    const handleColumnDragEnd = React.useCallback(() => {
        if (previewColumnOrder && !isSameOrder(extstate?.columnOrder || [], previewColumnOrder)) {
            setColumnOrder(previewColumnOrder);
        } else {
            setPreviewColumnOrder(null);
        }

        setDraggedColumnId(null);
    }, [extstate, previewColumnOrder, setColumnOrder]);

    const handleColumnDragCancel = React.useCallback(() => {
        setPreviewColumnOrder(null);
        setDraggedColumnId(null);
    }, []);

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

                table.setColumnSizing((previous) => ({
                    ...previous,
                    [id]: Math.max(max + 22, getTextWidth(header, context) + 48),
                }));
            }
        },
        [data, getTextWidth, table.setColumnSizing],
    );

    const RenderRow = React.useCallback(
        ({rowIndex, style}) => {
            const row = rows[rowIndex];
            const led = data[row.id].misc ? data[row.id].misc['Locate Miner State'] : null;
            return (
                <TableRow
                    key={row.id}
                    role="row"
                    style={{...style, display: 'flex'}}
                    component="div"
                    className={row.getIsSelected() ? 'Mui-selected' : ''}
                >
                    {row.getVisibleCells().map((cell) => {
                        const value = cell.getValue();
                        return (
                            <TableCell
                                key={cell.id}
                                role="cell"
                                style={{flex: `0 0 ${cell.column.getSize()}px`, width: cell.column.getSize()}}
                                component="div"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    color: cell.column
                                        ? cell.column.id === 'hbs'
                                            ? value === 3
                                                ? 'text.success'
                                                : 'text.error'
                                            : cell.column.id === 'performance'
                                              ? value == 'N/A' || value == 'Error'
                                                  ? 'text.error'
                                                  : getColorText(data[row.id].lowest)
                                              : cell.column.id === 'voltage'
                                                ? value <= 11.9
                                                    ? 'text.error'
                                                    : null
                                                : cell.column.id === 'lasterror'
                                                  ? value !== ' '
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
                                            ? value === 3
                                                ? 'success.main'
                                                : 'error.main'
                                            : cell.column.id === 'performance'
                                              ? value == 'N/A' || value == 'Error'
                                                  ? 'error.main'
                                                  : getColor(data[row.id].lowest)
                                              : cell.column.id === 'voltage'
                                                ? value <= 11.9
                                                    ? 'error.main'
                                                    : null
                                                : cell.column.id === 'lasterror'
                                                  ? value !== ' '
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
                                className={getColumnClassName(cell.column.id)}
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
                                <div style={{whiteSpace: 'pre'}}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            </TableCell>
                        );
                    })}
                </TableRow>
            );
        },
        [data, handleApiM, rows, state.rowSelection],
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
                                    Object.keys(state.rowSelection).map((id) => data[id].id),
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
                                    Object.keys(state.rowSelection).map((id) => data[id].id),
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
                                        <MenuItem onClick={() => table.toggleAllColumnsVisible()}>
                                            <IndeterminateCheckbox
                                                checked={allColumns
                                                    .filter((column) => column.id !== 'selection')
                                                    .every((column) => column.getIsVisible())}
                                                indeterminate={
                                                    allColumns
                                                        .filter((column) => column.id !== 'selection')
                                                        .some((column) => column.getIsVisible()) &&
                                                    !allColumns
                                                        .filter((column) => column.id !== 'selection')
                                                        .every((column) => column.getIsVisible())
                                                }
                                                onChange={null}
                                            />
                                            Show/Hide All
                                        </MenuItem>
                                        {allColumns.map((col) => {
                                            return col.id != 'selection' ? (
                                                <MenuItem key={col.id} onClick={() => col.toggleVisibility()}>
                                                    <IndeterminateCheckbox
                                                        checked={col.getIsVisible()}
                                                        onChange={null}
                                                    />
                                                    {col.columnDef.header}
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
            <DndContext
                sensors={sensors}
                modifiers={[restrictToHorizontalAxis]}
                collisionDetection={closestCenter}
                onDragStart={handleColumnDragStart}
                onDragOver={handleColumnDragOver}
                onDragEnd={handleColumnDragEnd}
                onDragCancel={handleColumnDragCancel}
            >
                <MaUTable component="div" role="table" id="datatable" style={{width: totalColumnsWidth}}>
                    <TableHead component="div" role="rowgroup" id="header" style={{display: 'block'}}>
                        {headerGroups.map((headerGroup) => (
                            <TableRow key={headerGroup.id} component="div" role="row" style={{display: 'flex'}}>
                                {headerGroup.headers.map((header) => (
                                    <ColumnHeaderCell
                                        key={header.id}
                                        header={header}
                                        draggedColumnId={draggedColumnId}
                                        resizeCol={resizeCol}
                                    />
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>

                    <TableBody component="div" role="rowgroup" style={{display: 'block'}}>
                        <FixedSizeGrid
                            height={tableViewportHeight}
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
                <DragOverlay>
                    <ColumnDragPreview column={draggedColumn} />
                </DragOverlay>
            </DndContext>
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
