import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import Module, {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {transformAsync} from '@babel/core';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const require = createRequire(import.meta.url);
const {Grid, Input, TextField} = require('@mui/material');
const dialogRequests = [];

async function compileTab(name) {
    const filename = fileURLToPath(new URL(`../src/tabs/${name}.jsx`, import.meta.url));
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
    compiled.require = (request) => {
        if (request.endsWith('.css')) return {};
        if (request === 'electron') {
            return {
                ipcRenderer: {
                    invoke: async (...args) => {
                        dialogRequests.push(args);
                        return {canceled: false, filePaths: ['/tmp/mui-upgrade-fixture.swu']};
                    },
                },
            };
        }
        return Module.prototype.require.call(compiled, request);
    };
    compiled._compile(code, filename);
    return compiled.exports[name];
}

const [WifiTab, TuneTab, FanTab, SystemTab, PerpetualtuneTab] = await Promise.all(
    ['WifiTab', 'TuneTab', 'FanTab', 'SystemTab', 'PerpetualtuneTab'].map(compileTab),
);

function instance(Component, state = {}, extraProps = {}) {
    const requests = [];
    const record = (api, data, selected) => requests.push({api, data, selected});
    const tab = new Component({
        sessionPass: 'fixture',
        selected: [0],
        data: [{cap: false, sum: false}],
        handleApi: record,
        handleFormApi: record,
        ...extraProps,
    });
    tab.state = {...tab.state, ...state};
    tab.setState = (update) => {
        tab.state = {...tab.state, ...(typeof update === 'function' ? update(tab.state) : update)};
    };
    return {tab, requests};
}

function elements(element, predicate) {
    if (!React.isValidElement(element)) return [];
    return [
        ...(predicate(element) ? [element] : []),
        ...React.Children.toArray(element.props.children).flatMap((child) => elements(child, predicate)),
    ];
}

const numericInputs = (tab) =>
    elements(tab.render(), (element) => element.type === Input).map((element) => element.props.slotProps?.input);
const isApplyAction = (element) =>
    typeof element.props.children === 'string' && element.props.children.startsWith('Apply');

test('Material UI and icons use matching v9 versions without unused Lab or legacy JSS dependencies', () => {
    const material = require('@mui/material/package.json').version;
    assert.match(material, /^9\./);
    assert.equal(require('@mui/icons-material/package.json').version, material);
    const dependencies = require('../package.json').dependencies;
    assert.equal(dependencies['@mui/lab'], undefined);
    assert.equal(dependencies['@mui/styles'], undefined);
});

test('MUI ESM exports resolve the modern React JSX runtime', async () => {
    const {default: MuiTextField} = await import('@mui/material/TextField');
    const markup = renderToStaticMarkup(
        React.createElement(MuiTextField, {label: 'Network Address', slotProps: {htmlInput: {maxLength: 11}}}),
    );
    assert.match(markup, /maxLength="11"/);
    assert.match(markup, /Network Address/);
});

test('renderer components no longer use removed Grid, TextField, checkbox or system props', async () => {
    const sources = await Promise.all(
        [
            ...['app.jsx', 'customTable.jsx'].map((name) => new URL(`../src/${name}`, import.meta.url)),
            ...(await readdir(new URL('../src/tabs/', import.meta.url)))
                .filter((name) => name.endsWith('.jsx'))
                .map((name) => new URL(`../src/tabs/${name}`, import.meta.url)),
        ].map(async (url) => {
            const {ast} = await transformAsync(await readFile(url, 'utf8'), {
                filename: fileURLToPath(url),
                babelrc: false,
                configFile: false,
                parserOpts: {plugins: ['jsx']},
                ast: true,
                code: false,
            });
            return ast;
        }),
    );
    const forbidden = {
        Grid: ['item', 'xs', 'sm', 'md', 'lg', 'xl', 'zeroMinWidth', 'alignItems', 'justifyContent'],
        TextField: ['InputProps', 'inputProps', 'InputLabelProps', 'SelectProps'],
        IndeterminateCheckbox: ['inputProps', 'inputRef'],
        Radio: ['inputProps', 'inputRef'],
        Input: ['inputProps'],
        ListItem: ['button'],
        Box: ['pl', 'pb', 'fontSize'],
    };
    let navigationButtons = 0;
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'JSXOpeningElement') {
            const name = node.name.name;
            if (name === 'ListItemButton') navigationButtons++;
            for (const attribute of node.attributes) {
                assert.ok(!forbidden[name]?.includes(attribute.name?.name), `${name}.${attribute.name?.name}`);
            }
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else visit(value);
        }
    }
    sources.forEach(visit);
    assert.equal(navigationButtons, 7);
});

test('Wifi retains native password limits, visibility controls and command payloads', () => {
    const {tab, requests} = instance(WifiTab, {ssid: 'fixture-network', psk: '12345678'});
    const password = elements(
        tab.render(),
        (element) => element.type === TextField && element.props.label === 'Wifi Password',
    )[0];
    assert.equal(password.props.type, 'password');
    assert.equal(password.props.slotProps.htmlInput.minLength, 8);
    const toggle = password.props.slotProps.input.endAdornment.props.children;
    toggle.props.onClick();
    assert.equal(tab.state.visible, true);
    const markup = renderToStaticMarkup(tab.render());
    assert.match(markup, /minLength="8"/);
    assert.match(markup, /toggle password visibility/);
    const apply = elements(tab.render(), isApplyAction)[0];
    assert.equal(apply.props.children, 'Apply to 1 miner');
    assert.equal(apply.props.disabled, false);
    apply.props.onClick();
    assert.equal(requests[0].api, '/wifi');
    assert.equal(requests[0].data.psk, '12345678');
    assert.deepEqual(requests[0].selected, [0]);
    tab.state.psk = 'short';
    assert.equal(elements(tab.render(), isApplyAction)[0].props.disabled, true);
});

test('tuning preserves native limits, note styling and separate tuning/overdrive commands', () => {
    const {tab, requests} = instance(TuneTab, {clock: 500, voltage: 12});
    assert.deepEqual(numericInputs(tab), [
        {step: 5, min: 50, max: 1000, type: 'number'},
        {step: 0.05, min: 12, max: 15, type: 'number'},
    ]);
    const markup = renderToStaticMarkup(tab.render());
    assert.match(markup, /min="50"/);
    assert.match(markup, /max="1000"/);
    assert.match(markup, /step="0.05"/);
    const note = elements(tab.render(), (element) =>
        React.Children.toArray(element.props.children)
            .filter((child) => typeof child === 'string')
            .join('')
            .includes('BM1366 ASIC chips'),
    )[0];
    assert.equal(note.props.sx.color, 'white');
    const applies = elements(tab.render(), isApplyAction);
    applies[0].props.onClick();
    applies.at(-1).props.onClick();
    assert.deepEqual(
        requests.map((request) => request.api),
        ['/overdrive', '/tune'],
    );
    assert.equal(requests[1].data.clock, 500);
    assert.equal(requests[1].data.voltage, 12);
    assert.deepEqual(requests[1].selected, [0]);
});

test('cooling preserves numeric limits and fan-speed command submission', () => {
    const {tab, requests} = instance(FanTab, {speed: 75});
    assert.ok(numericInputs(tab).some((props) => props?.min === 1 && props.max === 100 && props.step === 10));
    const markup = renderToStaticMarkup(tab.render());
    assert.match(markup, /type="number"/);
    assert.match(markup, /max="100"/);
    assert.match(markup, /settings-tab-footer/);
    const columns = elements(tab.render(), (element) => element.type === Grid && element.props.size?.xs === 12);
    assert.equal(columns.length, 3);
    assert.ok(columns.every((column) => column.props.size.md === 4));
    const apply = elements(tab.render(), isApplyAction)[0];
    apply.props.onClick();
    assert.equal(requests[0].api, '/fanspeed');
    assert.equal(requests[0].data.speed, 75);
    assert.deepEqual(requests[0].selected, [0]);
});

test('PerpetualTune keeps target, throttle and step limits and forwards algorithm metadata', () => {
    const {tab} = instance(
        PerpetualtuneTab,
        {
            checked: true,
            algo: 'VoltageOptimizer',
            num: 100,
            throttle: 20,
            min: 10,
            max: 200,
        },
        {
            data: [
                {
                    cap: {
                        PerpetualTune: {
                            fixture: {
                                algorithm: 'VoltageOptimizer',
                                name: 'Voltage optimizer',
                                description: 'Fixture algorithm',
                                min: 10,
                                max: 200,
                            },
                        },
                    },
                },
            ],
        },
    );
    assert.deepEqual(numericInputs(tab), [
        {step: 1, min: 20, max: 200, type: 'number'},
        {step: 1, min: 10, max: 100, type: 'number'},
        {step: 1, min: 1, max: 80, type: 'number'},
    ]);
    const markup = renderToStaticMarkup(tab.render());
    assert.match(markup, /tab-body settings-tab perpetual-tune-tab/);
    assert.match(markup, /settings-tab-footer perpetual-tune-actions/);
    assert.match(markup, /max="200"/);
    assert.match(markup, /max="80"/);
    assert.match(markup, /value="VoltageOptimizer"/);
    assert.match(markup, /name="Voltage optimizer"/);
    assert.match(markup, /id="Fixture algorithm"/);
    tab.updateAlgorithm({
        target: {value: 'VoltageOptimizer', name: 'Voltage optimizer', id: 'Fixture algorithm', min: '10', max: '200'},
    });
    assert.equal(tab.state.name, 'Voltage optimizer');
    assert.equal(tab.state.desc, 'Fixture algorithm');
    assert.equal(tab.state.min, 10);
    assert.equal(tab.state.max, 200);
});

test('firmware selection retains its extension when React batches state updates', async () => {
    const {tab} = instance(SystemTab);
    const pending = [];
    tab.setState = (update) => pending.push(update);
    tab.updateFilepath();
    await new Promise((resolve) => setImmediate(resolve));
    tab.state = pending.reduce((state, update) => ({...state, ...update}), tab.state);
    assert.equal(tab.state.filepath, '/tmp/mui-upgrade-fixture.swu');
    assert.equal(tab.state.fileext, 'swu');
});

test('firmware Browse remains interactive inside the disabled file field and preserves upload routing', async () => {
    const {tab, requests} = instance(SystemTab);
    const file = elements(
        tab.render(),
        (element) => element.type === TextField && element.props.label.startsWith('System Update File'),
    )[0];
    assert.equal(file.props.disabled, true);
    const browse = file.props.slotProps.input.endAdornment.props.children;
    assert.equal(browse.props.children, 'Browse');
    browse.props.onClick();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(dialogRequests[0][0], 'dialog-open');
    assert.deepEqual(dialogRequests[0][1].filters[0].extensions, ['zip', 'swu']);
    assert.equal(tab.state.fileext, 'swu');
    const apply = elements(tab.render(), isApplyAction)[0];
    assert.equal(apply.props.disabled, false);
    apply.props.onClick();
    assert.equal(requests[0].api, '/update');
    assert.deepEqual(requests[0].selected, [0]);
    tab.state.fileext = 'zip';
    elements(tab.render(), isApplyAction)[0].props.onClick();
    assert.equal(requests[1].api, '/systemupdate');
});
