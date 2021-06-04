import React from "react";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MuiCheckbox from "@material-ui/core/Checkbox";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import ViewWeekIcon from '@material-ui/icons/ViewWeek';

import {
  useTable,
  useBlockLayout,
  useResizeColumns,
  useRowSelect,
  useSortBy
} from "react-table";
import { FixedSizeGrid } from "react-window";

import "./customTable.css";

function getTextWidth(input, context) {
  return Math.ceil(context.measureText(input).width);
}

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

function Table({ dataRaw, columnsRaw, initialState, update, model }) {
    const defaultColumn = React.useMemo(
        () => ({
            minWidth: 50,
            width: 150,
            maxWidth: 500
        }),
        []
    );

    const data = React.useMemo(() => dataRaw, [dataRaw]);
    const columns = React.useMemo(() => columnsRaw, []);
    const updateState = React.useCallback((a, b, c, data, model) => update(a, b, c, data, model));

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
        allColumns,
        totalColumnsWidth,
        getToggleHideAllColumnsProps,
        state,
        resetResizing,
        selectedFlatRows,
        toggleHideColumn,
        toggleHideAllColumns
    } = useTable(
    {
        columns,
        data,
        initialState,
        defaultColumn,
        stateReducer: (a, b, c) => {
            if (b.type != "columnResizing" && b.type !='resetSelectedRows' && b.type !='resetSortBy') {
                updateState(a, b, c, dataRaw, model);
            }
        }
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy,
    useRowSelect,
    (hooks) => {
        hooks.visibleColumns.push((columns) => [
            {
                id: "selection",
                width: 50,
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

    const scroll = (obj) => {
        document.getElementById('header').style.transform = `translateX(${-obj.scrollLeft}px)`;
    }

  const RenderRow = React.useCallback(
    ({ columnIndex, rowIndex, style }) => {
        const row = rows[rowIndex];
        prepareRow(row);
        console.log('row render');
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
                                <div {...column.getSortByToggleProps()}>
                                    {column.render("Header")}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                            ? ' 🔽'
                                            : ' 🔼'
                                            : ''}
                                    </span>
                                </div>
                                <div
                                    {...column.getResizerProps()}
                                    className={`resizer ${ column.isResizing ? "isResizing" : "" }`}
                                    onDoubleClick={() => {
                                        if (column.id != "selection") {
                                            let max = 0;
                                            const start = Date.now();
                                            const context = document.getElementById('canvas').getContext('2d');
                                            context.font = '14px Roboto';
                                            data.forEach((row) => {
                                                const width = getTextWidth(row[column.id], context);
                                                if (width > max) max = width;
                                            });
                                            console.log('done calc', Date.now() - start);
                                            state.columnResizing.columnWidths[column.id] = Math.max(max, getTextWidth(column.Header, context)) + 32;
                                            console.log('done state', Date.now() - start);
                                            //column.toggleHidden();
                                            //column.toggleHidden();
                                            console.log('done toggle', Date.now() - start);
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
                    height={400}
                    rowHeight={32}
                    rowCount={rows.length}
                    columnCount={1}
                    columnWidth={totalColumnsWidth + 24}
                    width={window.innerWidth - 18}
                    onScroll={scroll}
                >
                    {RenderRow}
                </FixedSizeGrid>
            </TableBody>
        </MaUTable>
    </React.Fragment>
  );
}

export default Table;