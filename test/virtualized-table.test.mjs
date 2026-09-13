import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Module, {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {transformAsync} from '@babel/core';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {List} from 'react-window';

const require = createRequire(import.meta.url);
const filename = fileURLToPath(new URL('../src/virtualizedTable.jsx', import.meta.url));
const {code} = await transformAsync(await readFile(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    targets: {node: '22'},
    presets: [
        ['@babel/preset-react', {runtime: 'automatic'}],
        ['@babel/preset-env', {modules: 'commonjs'}],
    ],
});
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(path.dirname(filename));
compiled._compile(code, filename);
const {VirtualizedTableBody: virtualizedTableBody} = compiled.exports;

const rows = Array.from({length: 1000}, (_, index) => ({id: `miner-${index}`}));
const renderRow = ({rowIndex, style, ariaRowIndex}) =>
    createElement('div', {role: 'row', style, 'aria-rowindex': ariaRowIndex}, `Miner ${rowIndex}`);
const options = {rows, rowWidth: 2000, height: 64, width: 600, renderRow};

test('react-window 2 is installed with the supported React 19 runtime', () => {
    assert.match(require('react-window/package.json').version, /^2\./);
    assert.match(require('react/package.json').version, /^19\./);
});

test('the table uses the v2 List API with explicit viewport and row dimensions', () => {
    const onScroll = () => {};
    const {type, props} = virtualizedTableBody({...options, onScroll});
    assert.equal(type, List);
    assert.equal(props.role, 'rowgroup');
    assert.deepEqual(props.style, {height: 64, width: 600, overflow: 'auto'});
    assert.equal(props.defaultHeight, 64);
    assert.equal(props.rowHeight, 32);
    assert.equal(props.rowCount, 1000);
    assert.equal(props.onScroll, onScroll);
    assert.equal(props.rowProps.rows, rows);
    assert.equal(props.rowProps.renderRow, renderRow);
});

test('row rendering preserves virtualization positioning, horizontal width and table semantics', () => {
    const {props} = virtualizedTableBody(options);
    const style = {position: 'absolute', height: 32, width: '100%', transform: 'translateY(3200px)'};
    const element = props.rowComponent({
        ...props.rowProps,
        index: 100,
        style,
        ariaAttributes: {role: 'listitem', 'aria-posinset': 101, 'aria-setsize': 1000},
    });
    assert.deepEqual(element.props.style, {...style, width: 2000});
    assert.equal(element.props.role, 'row');
    assert.equal(element.props['aria-rowindex'], 102);
    assert.equal(element.props.children, 'Miner 100');
    assert.equal(element.props['aria-posinset'], undefined);
});

test('row component and keys stay stable when sorting, filtering or updating table state', () => {
    const first = virtualizedTableBody(options).props;
    const reordered = virtualizedTableBody({...options, rows: [rows[99], rows[4]], renderRow: () => null}).props;
    assert.equal(first.rowComponent, reordered.rowComponent);
    assert.equal(first.rowKey, reordered.rowKey);
    assert.equal(first.rowKey(99, first.rowProps), reordered.rowKey(0, reordered.rowProps));
    assert.equal(reordered.rowKey(1, reordered.rowProps), 'miner-4');
    assert.notEqual(first.rowProps.renderRow, reordered.rowProps.renderRow);
});

test('the virtualized body retains the MUI body context without adding a nested rowgroup', async () => {
    const source = await readFile(new URL('../src/customTable.jsx', import.meta.url), 'utf8');
    const {ast} = await transformAsync(source, {
        filename: 'customTable.jsx',
        babelrc: false,
        configFile: false,
        parserOpts: {plugins: ['jsx']},
        ast: true,
        code: false,
    });
    let body;
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'JSXElement' && node.openingElement.name.name === 'TableBody') body = node;
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else visit(value);
        }
    }
    visit(ast.program);
    const attributes = Object.fromEntries(body.openingElement.attributes.map(({name, value}) => [name.name, value]));
    assert.equal(attributes.component.value, 'div');
    assert.equal(attributes.role.value, 'presentation');
    assert.ok(body.children.some((node) => node.openingElement?.name.name === 'VirtualizedTableBody'));

    const TableBody = require('@mui/material/TableBody').default;
    const TableRow = require('@mui/material/TableRow').default;
    const TableCell = require('@mui/material/TableCell').default;
    const markup = renderToStaticMarkup(
        createElement(
            TableBody,
            {component: attributes.component.value, role: attributes.role.value},
            virtualizedTableBody({
                ...options,
                rows: [rows[0]],
                renderRow: ({style}) =>
                    createElement(
                        TableRow,
                        {component: 'div', role: 'row', style},
                        createElement(TableCell, {component: 'div', role: 'cell'}, 'Miner'),
                    ),
            }),
        ),
    );
    assert.match(markup, /MuiTableCell-body/);
    assert.equal((markup.match(/role="rowgroup"/g) || []).length, 1);
});

test('the real v2 List renders only a bounded window of a large miner table', () => {
    const markup = renderToStaticMarkup(virtualizedTableBody(options));
    const renderedRows = markup.match(/role="row"/g) || [];
    assert.ok(renderedRows.length > 1 && renderedRows.length < 20);
    assert.match(markup, /height:32000px/);
    assert.match(markup, /transform:translateY\(32px\)/);
    assert.match(markup, /width:2000px/);
    assert.match(markup, /role="rowgroup"/);
    assert.doesNotMatch(markup, /role="(?:list|listitem|grid|gridcell)"/);
});

test('an empty filtered table renders safely and retains its horizontal scroll extent', () => {
    const markup = renderToStaticMarkup(
        virtualizedTableBody({
            ...options,
            rows: [],
            renderRow() {
                throw new Error('No rows to render');
            },
        }),
    );
    assert.doesNotMatch(markup, /role="row"/);
    assert.match(markup, /width:2000px;height:0/);
    assert.match(markup, /role="rowgroup"/);
});
