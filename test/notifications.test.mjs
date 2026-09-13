import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Module, {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {transformAsync} from '@babel/core';
import {renderToStaticMarkup} from 'react-dom/server';

const require = createRequire(import.meta.url);
const filename = fileURLToPath(new URL('../src/notifications.jsx', import.meta.url));
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
// Compile the real JSX without writing generated files or importing Electron.
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(path.dirname(filename));
compiled._compile(code, filename);
const {Notifications: notifications, notificationContent, notify} = compiled.exports;

test('Toastify 11 supports the React 18 bridge and React 19', () => {
    assert.match(require('react-toastify/package.json').version, /^11\./);
    assert.match(require('react/package.json').version, /^(18|19)\./);
});

test('notifications retain the dashboard timing, interaction and styling settings', () => {
    const {props} = notifications();
    assert.equal(props.position, 'top-right');
    assert.equal(props.autoClose, 5000);
    assert.equal(props.hideProgressBar, true);
    assert.equal(props.closeOnClick, true);
    assert.equal(props.draggable, false);
    assert.equal(props.closeButton, false);
    assert.equal(props.pauseOnFocusLoss, false);
    assert.equal(props.toastClassName, 'dashboard-toast');
    assert.equal(props.ariaLabel, 'Dashboard notifications');
});

test('notification content renders a filled MUI alert with its severity and message', () => {
    const element = notificationContent('error', 'Miner request failed')({closeToast() {}});
    assert.equal(element.props.severity, 'error');
    assert.equal(element.props.variant, 'filled');
    const markup = renderToStaticMarkup(element);
    assert.match(markup, /Miner request failed/);
    assert.match(markup, /MuiAlert-filledError/);
});

test('the alert close button reports a user dismissal using the v11 API', () => {
    const reasons = [];
    const element = notificationContent('success', 'Complete')({closeToast: (reason) => reasons.push(reason)});
    element.props.onClose({type: 'click'});
    assert.deepEqual(reasons, [true]);
});

test('scan and miner notification IDs remain usable for programmatic dismissal', () => {
    assert.equal(
        notify('info', 'Scanning...', {toastId: 'scan', autoClose: false, hideProgressBar: false, pauseOnHover: false}),
        'scan',
    );
    assert.equal(notify('info', 'Updating...', {toastId: 0, autoClose: 600000}), 0);
});
