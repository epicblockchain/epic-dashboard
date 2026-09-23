import {
    columnFilteringFeature,
    columnOrderingFeature,
    columnResizingFeature,
    columnSizingFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createSortedRowModel,
    filterFn_includesString,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    tableFeatures,
} from '@tanstack/react-table';

export const minerTableFeatures = tableFeatures({
    columnFilteringFeature,
    columnOrderingFeature,
    columnResizingFeature,
    columnSizingFeature,
    columnVisibilityFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
});

function numericValue(value) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

function hashrateValue(value) {
    const [number, unit] = String(value).split(' ');
    return numericValue(number) * ({'TH/s': 1e6, 'GH/s': 1e3, 'MH/s': 1}[unit] || 0);
}

const numericSort = (a, b, id) => numericValue(a.getValue(id)) - numericValue(b.getValue(id));
const hashrateSort = (a, b, id) => hashrateValue(a.getValue(id)) - hashrateValue(b.getValue(id));
const targetSort = (a, b, id) => numericValue(a.getValue(id)?.value) - numericValue(b.getValue(id)?.value);
const targetFilter = (row, id, value) =>
    String(row.getValue(id)?.value ?? '')
        .toLowerCase()
        .includes(String(value).toLowerCase());
targetFilter.autoRemove = (value) => !value;

export const minerColumns = [
    {accessorKey: 'status', header: 'Status', size: 110},
    {accessorKey: 'ip', header: 'IP', size: 150},
    {accessorKey: 'name', header: 'Name', size: 150},
    {accessorKey: 'firmware', header: 'Firmware', size: 108},
    {accessorKey: 'model', header: 'Model', size: 150},
    {accessorKey: 'mode', header: 'Mode', size: 150},
    {accessorKey: 'pool', header: 'Pool', size: 180},
    {accessorKey: 'user', header: 'User', size: 210, maxSize: 700},
    {accessorKey: 'start', header: 'Started', size: 150},
    {accessorKey: 'uptime', header: 'Uptime', size: 135},
    {accessorKey: 'hbs', header: 'Active HBs', size: 118},
    {accessorKey: 'perpetualtune', header: 'Enabled', size: 125},
    {accessorKey: 'perpetualtunealgo', header: 'Algorithm', size: 145},
    {accessorKey: 'perpetualtuneoptimized', header: 'Optimized', size: 135},
    {
        accessorKey: 'perpetualtunetarget',
        header: 'Target',
        size: 120,
        sortFn: targetSort,
        filterFn: targetFilter,
    },
    {accessorKey: 'perpetualtuneminthrottle', header: 'Min Throttle', size: 150},
    {accessorKey: 'perpetualtunethrottlestep', header: 'Throttle Step', size: 150},
    {accessorKey: 'shutdowntemp', header: 'Shutdown Temperature', size: 170},
    {accessorKey: 'criticaltemp', header: 'Critical Temperature', size: 170},
    {accessorKey: 'performance', header: 'Hashboard Performance', size: 250},
    {accessorKey: 'realtimehashrate', header: 'Realtime Hashrate', size: 200},
    {accessorKey: 'hashrate15min', header: 'Hashrate (15min)', size: 150, sortFn: hashrateSort},
    {accessorKey: 'hashrate1hr', header: 'Hashrate (1h)', size: 150, sortFn: hashrateSort},
    {accessorKey: 'hashrate6hr', header: 'Hashrate (6h)', size: 150, sortFn: hashrateSort},
    {accessorKey: 'hashrate24hr', header: 'Hashrate (24h)', size: 150, sortFn: hashrateSort},
    {accessorKey: 'efficiency1hr', header: 'Efficiency (1h)', size: 140, sortFn: numericSort},
    {accessorKey: 'accepted', header: 'Accepted Shares', size: 150},
    {accessorKey: 'rejected', header: 'Rejected Shares', size: 150},
    {accessorKey: 'difficulty', header: 'Difficulty', size: 120},
    {accessorKey: 'temperature', header: 'Temp', size: 84},
    {accessorKey: 'power', header: 'Power (W)', size: 110},
    {accessorKey: 'fanspeed', header: 'Fan Speed', size: 115},
    {accessorKey: 'voltage', header: 'Input Voltage', size: 100, sortFn: numericSort},
    {accessorKey: 'clock', header: 'Avg Clock', size: 210},
    {accessorKey: 'fansrpm', header: 'Fans Rpm', size: 370},
    {accessorKey: 'lasterror', header: 'Last Error', size: 250},
    {accessorKey: 'mac', header: 'MAC Address', size: 250},
];

export const tableColumnIds = minerColumns.map(({accessorKey}) => accessorKey);
export const minerDefaultColumn = {
    minSize: 50,
    size: 150,
    maxSize: 500,
    sortDescFirst: false,
    sortFn: sortFn_alphanumeric,
    filterFn: filterFn_includesString,
};

export function getColumnVisibility(hiddenColumns = []) {
    return Object.fromEntries([...hiddenColumns.map((id) => [id, false]), ['selection', true]]);
}

// Keep the existing on-disk preferences format; selection is always pinned first.
export function getTablePreferences(state) {
    return {
        hiddenColumns: tableColumnIds.filter((id) => state.columnVisibility[id] === false),
        columnOrder: state.columnOrder.filter((id) => id !== 'selection'),
    };
}

export function moveColumnOrder(order, visibleIds, activeId, targetId) {
    const oldIndex = visibleIds.indexOf(activeId);
    const newIndex = visibleIds.indexOf(targetId);
    if (oldIndex < 0 || newIndex < 0) return null;
    const nextVisible = visibleIds.slice();
    nextVisible.splice(oldIndex, 1);
    nextVisible.splice(newIndex, 0, activeId);
    let index = 0;
    return order.map((id) => (visibleIds.includes(id) ? nextVisible[index++] : id));
}

export function getRangeSelection(rows, anchorId, rowId, baseSelection, shouldSelect) {
    const anchorIndex = rows.findIndex((row) => row.id === anchorId);
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    if (anchorIndex < 0 || rowIndex < 0) return null;
    const selection = {...baseSelection};
    const start = Math.min(anchorIndex, rowIndex);
    const end = Math.max(anchorIndex, rowIndex);
    for (const row of rows.slice(start, end + 1)) {
        if (shouldSelect) selection[row.id] = true;
        else delete selection[row.id];
    }
    return selection;
}

export function getMinerRowId(row) {
    return String(row?.ip || row?.id);
}

export function getSelectedModelIndex(models, selectedModel, fallbackIndex = 0) {
    if (!Array.isArray(models) || models.length === 0) return 0;

    const selectedIndex = models.indexOf(selectedModel);
    if (selectedIndex >= 0) return selectedIndex;

    const safeFallback = Number.isInteger(fallbackIndex) ? fallbackIndex : 0;
    return Math.min(Math.max(safeFallback, 0), models.length - 1);
}

export function haveSameModels(first, second) {
    return (
        Array.isArray(first) &&
        Array.isArray(second) &&
        first.length === second.length &&
        first.every((model, index) => model === second[index])
    );
}

export function normalizeTargetCell(value) {
    const target = value && typeof value === 'object' ? value.value : value;
    const tooltip = value && typeof value === 'object' ? value.tooltip : null;
    const safeTarget = target == null ? 'N/A' : typeof target === 'object' ? String(target) : target;
    const safeTooltip = tooltip == null || typeof tooltip === 'string' ? tooltip : String(tooltip);

    return {value: safeTarget, tooltip: safeTooltip};
}

export function createMinerErrorRow(id, miner) {
    const candidateCap = miner?.cap;
    const cap =
        candidateCap && typeof candidateCap === 'object' && typeof candidateCap.Model === 'string'
            ? candidateCap
            : undefined;
    const error = 'Error';

    return {
        id,
        ip: typeof miner?.ip === 'string' ? miner.ip : '',
        status: error,
        name: error,
        firmware: error,
        model: cap?.Model || error,
        mode: error,
        pool: error,
        user: error,
        start: error,
        uptime: error,
        hbs: error,
        perpetualtune: error,
        perpetualtunealgo: error,
        perpetualtuneoptimized: error,
        perpetualtunetarget: {value: error, tooltip: null},
        perpetualtuneminthrottle: error,
        perpetualtunethrottlestep: error,
        shutdowntemp: error,
        criticaltemp: error,
        performance: error,
        lowest: 0,
        realtimehashrate: error,
        hashrate15min: error,
        hashrate1hr: error,
        hashrate6hr: error,
        hashrate24hr: error,
        efficiency1hr: error,
        accepted: error,
        rejected: error,
        difficulty: error,
        temperature: error,
        power: error,
        fanspeed: error,
        cap,
        voltage: error,
        clock: error,
        misc: null,
        connected: error,
        lasterror: error,
        mac: error,
        fansrpm: error,
    };
}

export function getOrderedSelectedMiners(previousSelection, rowSelection, data) {
    const rowsById = new Map(data.map((row) => [getMinerRowId(row), row]));
    const remaining = new Set(
        Object.keys(rowSelection)
            .filter((id) => rowSelection[id] && (rowsById.has(id) || data[id]))
            .map((id) => (rowsById.get(id) || data[id]).id),
    );
    const selected = previousSelection.filter((id) => {
        if (!remaining.has(id)) return false;
        remaining.delete(id);
        return true;
    });
    return selected.concat([...remaining]);
}
