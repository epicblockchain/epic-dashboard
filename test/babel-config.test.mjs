import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {transformAsync, version} from '@babel/core';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const rule = require('../webpack.rules.js').find((item) => item.use?.loader === 'babel-loader');
const options = rule.use.options;
const transform = (source, overrides = {}) =>
    transformAsync(source, {
        ...options,
        babelrc: false,
        configFile: false,
        filename: path.join(root, 'src/babel-regression.jsx'),
        caller: {name: 'babel-loader', supportsStaticESM: true, supportsDynamicImport: true},
        envName: 'production',
        ...overrides,
    });

test('Babel packages use v8 and target the installed Electron runtime', () => {
    assert.match(version, /^8\./);
    for (const preset of ['@babel/preset-env', '@babel/preset-react']) {
        assert.match(require(`${preset}/package.json`).version, /^8\./);
    }
    assert.deepEqual(options.targets, {electron: require('electron/package.json').version});
    assert.equal(rule.exclude.test(path.join(root, 'node_modules/example/index.js')), true);
    assert.equal(rule.exclude.test(path.join(root, 'src/app.jsx')), false);
});

for (const envName of ['production', 'development']) {
    test(`JSX uses the automatic runtime in ${envName} without implicit development changes`, async () => {
        const {code} = await transform('export const view = <div {...props}>Dashboard</div>;', {envName});
        assert.match(code, /react\/jsx-runtime/);
        assert.doesNotMatch(code, /React\.createElement|jsxDEV/);
    });
}

test('native Electron syntax and built-ins do not need legacy transforms or polyfills', async () => {
    const {code} = await transform('export async function latest(values) { return values.at(-1) ?? null; }');
    assert.match(code, /async function latest/);
    assert.match(code, /\.at\(-1\)/);
    assert.match(code, /\?\?/);
    assert.doesNotMatch(code, /core-js\/modules|regeneratorRuntime/);
});

test('the replacement plugin still injects required global core-js polyfills', async () => {
    const {code} = await transform('export const latest = [1, 2].at(-1);', {targets: {chrome: '49'}});
    assert.match(code, /core-js\/modules\/es\.array\.at\.js/);
    const [name, settings] = options.plugins[0];
    assert.equal(name, 'babel-plugin-polyfill-corejs3');
    assert.equal(settings.method, 'usage-global');
    assert.equal(settings.version, require('core-js/package.json').version);
});
