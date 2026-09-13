import {List} from 'react-window';

// Keep the component identity stable while passing fresh table state through rowProps.
function VirtualizedRow({index, style, rowWidth, renderRow}) {
    return renderRow({rowIndex: index, style: {...style, width: rowWidth}, ariaRowIndex: index + 2});
}

const getRowKey = (index, {rows}) => rows[index].id;

export function VirtualizedTableBody({rows, rowWidth, height, width, renderRow, onScroll}) {
    return (
        <List
            role="rowgroup"
            className="grid"
            style={{height, width, overflow: 'auto'}}
            defaultHeight={height}
            rowHeight={32}
            rowCount={rows.length}
            rowComponent={VirtualizedRow}
            rowProps={{rows, rowWidth, renderRow}}
            rowKey={getRowKey}
            onScroll={onScroll}
        >
            {/* Retain horizontal scrolling even when no rows match the current filters. */}
            <div aria-hidden="true" style={{width: rowWidth, height: 0}} />
        </List>
    );
}
