import assert from 'node:assert/strict';
import {test} from 'node:test';
import {constructTable} from '@tanstack/react-table';
import {storeReactivityBindings} from '@tanstack/table-core/store-reactivity-bindings';
import {
    minerColumns,
    minerDefaultColumn,
    minerTableFeatures,
    tableColumnIds,
    getColumnVisibility,
    getTablePreferences,
    moveColumnOrder,
    getRangeSelection,
    getMinerRowId,
    getOrderedSelectedMiners,
} from '../src/minerTable.mjs';

const data = [
    {
        id: 12,
        ip: '192.0.2.1',
        name: 'Miner 10',
        hashrate15min: '2 GH/s',
        voltage: '12.4',
        perpetualtunetarget: {value: '120 (110)', tooltip: 'Throttled'},
    },
    {
        id: 4,
        ip: '192.0.2.2',
        name: 'Miner 2',
        hashrate15min: '1 TH/s',
        voltage: '9.8',
        perpetualtunetarget: {value: '20'},
    },
    {id: 9, ip: '192.0.2.3', name: 'Spare', hashrate15min: 'N/A', voltage: 'N/A', perpetualtunetarget: {value: 'N/A'}},
    {
        id: 7,
        ip: '192.0.2.4',
        name: 'Miner 1',
        hashrate15min: '900 MH/s',
        voltage: 12.1,
        perpetualtunetarget: {value: 0},
    },
];

function createTable(initialState = {}) {
    return constructTable({
        features: {...minerTableFeatures, coreReactivityFeature: storeReactivityBindings()},
        data,
        columns: [
            {
                id: 'selection',
                size: 50,
                minSize: 50,
                maxSize: 50,
                enableHiding: false,
                enableResizing: false,
                enableSorting: false,
                enableColumnFilter: false,
            },
            ...minerColumns,
        ],
        defaultColumn: minerDefaultColumn,
        initialState,
    });
}

const ids = (table) => table.getRowModel().rows.map((row) => row.original.id);

test('all existing column IDs and custom sizing survive the migration', () => {
    assert.equal(tableColumnIds.length, 37);
    assert.equal(new Set(tableColumnIds).size, tableColumnIds.length);
    const table = createTable();
    assert.equal(table.getColumn('selection').getSize(), 50);
    assert.equal(table.getColumn('user').getSize(), 210);
    assert.equal(table.getColumn('user').columnDef.maxSize, 700);
    assert.equal(table.getColumn('selection').getCanSort(), false);
    assert.equal(table.getColumn('selection').getCanFilter(), false);
    assert.equal(table.getColumn('selection').getCanResize(), false);
});

test('natural text sorting and Shift multi-column sorting use the new API', () => {
    const table = createTable();
    table.getColumn('name').toggleSorting(false);
    assert.deepEqual(ids(table), [7, 4, 12, 9]);
    table.getColumn('voltage').toggleSorting(false, true);
    assert.deepEqual(
        table.atoms.sorting.get().map(({id}) => id),
        ['name', 'voltage'],
    );
});

test('hashrate sorting compares MH/s, GH/s and TH/s numerically', () => {
    const table = createTable();
    table.setSorting([{id: 'hashrate15min', desc: false}]);
    assert.deepEqual(ids(table), [9, 7, 12, 4]);
    table.setSorting([{id: 'hashrate15min', desc: true}]);
    assert.deepEqual(ids(table), [4, 12, 7, 9]);
    const sort = table.getColumn('hashrate15min').columnDef.sortFn;
    const row = table.getCoreRowModel().rows[0];
    assert.equal(sort(row, row, 'hashrate15min'), 0);
});

test('numeric sorting handles numeric strings and unavailable readings', () => {
    const table = createTable();
    table.setSorting([{id: 'voltage', desc: false}]);
    assert.deepEqual(ids(table), [9, 4, 7, 12]);
});

test('tooltip targets sort by their displayed numeric value', () => {
    const table = createTable();
    table.setSorting([{id: 'perpetualtunetarget', desc: false}]);
    assert.deepEqual(ids(table), [9, 7, 4, 12]);
});

test('text filters are case-insensitive, composable, and removable', () => {
    const table = createTable();
    table.getColumn('name').setFilterValue('MINER');
    assert.deepEqual(ids(table), [12, 4, 7]);
    table.getColumn('ip').setFilterValue('192.0.2.2');
    assert.deepEqual(ids(table), [4]);
    table.getColumn('ip').setFilterValue(undefined);
    table.getColumn('name').setFilterValue('');
    assert.deepEqual(ids(table), [12, 4, 9, 7]);
});

test('object-valued tooltip cells filter on visible text, including zero', () => {
    const table = createTable();
    table.getColumn('perpetualtunetarget').setFilterValue('(110)');
    assert.deepEqual(ids(table), [12]);
    table.getColumn('perpetualtunetarget').setFilterValue('n/a');
    assert.deepEqual(ids(table), [9]);
    table.getColumn('perpetualtunetarget').setFilterValue('0');
    assert.deepEqual(ids(table), [12, 4, 7]);
});

test('select-all respects the filtered rows and retains outside selections', () => {
    const table = createTable();
    table.getRow('2').toggleSelected(true);
    table.getColumn('name').setFilterValue('Miner');
    table.toggleAllRowsSelected(true);
    assert.deepEqual({...table.atoms.rowSelection.get()}, {0: true, 1: true, 2: true, 3: true});
    table.toggleAllRowsSelected(false);
    assert.deepEqual({...table.atoms.rowSelection.get()}, {2: true});
    assert.equal(table.getIsAllRowsSelected(), false);
});

test('selection resolves original miner IDs rather than sorted row positions', () => {
    const table = createTable();
    table.setSorting([{id: 'name', desc: false}]);
    table.getRowModel().rows[0].toggleSelected(true);
    table.getRowModel().rows[1].toggleSelected(true);
    assert.deepEqual(getOrderedSelectedMiners([7], table.atoms.rowSelection.get(), data), [7, 4]);
    assert.deepEqual(getOrderedSelectedMiners([12, 7, 4], {1: true, 3: true, 99: true, 0: false}, data), [7, 4]);
});

test('selection remains attached to a miner IP across data refreshes', () => {
    const rowSelection = {[getMinerRowId(data[1])]: true};
    assert.deepEqual(getOrderedSelectedMiners([], rowSelection, data), [4]);
    assert.deepEqual(getOrderedSelectedMiners([], rowSelection, [...data].reverse()), [4]);
});

test('Shift selection follows the displayed sorted and filtered range', () => {
    const table = createTable();
    table.getColumn('name').setFilterValue('Miner');
    table.setSorting([{id: 'name', desc: false}]);
    const rows = table.getRowModel().rows;
    const base = {2: true, 3: true};
    const selected = getRangeSelection(rows, '3', '0', base, true);
    assert.deepEqual(selected, {0: true, 1: true, 2: true, 3: true});
    assert.deepEqual(getRangeSelection(rows, '0', '3', selected, false), {2: true});
    assert.deepEqual(base, {2: true, 3: true});
    assert.equal(getRangeSelection(rows, 'missing', '0', base, true), null);
    assert.equal(getRangeSelection(rows, '3', 'missing', base, true), null);
});

test('saved visibility and order restore without hiding the selection column', () => {
    const table = createTable({
        columnVisibility: getColumnVisibility(['name', 'selection']),
        columnOrder: ['selection', 'ip', 'user'],
    });
    assert.deepEqual(
        table
            .getVisibleLeafColumns()
            .slice(0, 3)
            .map(({id}) => id),
        ['selection', 'ip', 'user'],
    );
    assert.equal(table.getColumn('name').getIsVisible(), false);
    table.toggleAllColumnsVisible(false);
    assert.deepEqual(
        table.getVisibleLeafColumns().map(({id}) => id),
        ['selection'],
    );
    table.toggleAllColumnsVisible(true);
    assert.equal(table.getVisibleLeafColumns().length, tableColumnIds.length + 1);
});

test('preferences retain the existing format and exclude the selection column', () => {
    assert.deepEqual(
        getTablePreferences({
            columnVisibility: getColumnVisibility(['name']),
            columnOrder: ['selection', 'ip', 'name'],
        }),
        {hiddenColumns: ['name'], columnOrder: ['ip', 'name']},
    );
});

test('dragging visible columns preserves the positions of hidden columns', () => {
    const order = ['ip', 'model', 'name', 'pool'];
    assert.deepEqual(moveColumnOrder(order, ['ip', 'name', 'pool'], 'pool', 'ip'), ['pool', 'model', 'ip', 'name']);
    assert.deepEqual(order, ['ip', 'model', 'name', 'pool']);
    assert.equal(moveColumnOrder(order, ['ip', 'name', 'pool'], 'selection', 'ip'), null);
    assert.equal(moveColumnOrder(order, ['ip', 'name', 'pool'], 'ip', 'model'), null);
});

test('column resizing respects minimum and maximum sizes and updates total width', () => {
    const table = createTable();
    const before = table.getTotalSize();
    table.setColumnSizing({ip: 200});
    assert.equal(table.getColumn('ip').getSize(), 200);
    assert.equal(table.getTotalSize(), before + 50);
    table.setColumnSizing({ip: 1, user: 900});
    assert.equal(table.getColumn('ip').getSize(), 50);
    assert.equal(table.getColumn('user').getSize(), 700);
});
