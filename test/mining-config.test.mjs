import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Module from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {transformAsync} from '@babel/core';
import React from 'react';

const filename = fileURLToPath(new URL('../src/tabs/CoinTab.jsx', import.meta.url));
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
const {CoinTab} = compiled.exports;

function createConfig() {
    const requests = [];
    const config = new CoinTab({
        selected: [0],
        data: [{cap: {Coins: ['BTC']}}],
        sessionPass: 'fixture',
        handleApi: async (api, data, selected) => {
            requests.push({api, data, selected});
            return false;
        },
    });
    config.state = {
        ...config.state,
        coin: 'BTC',
        checked: false,
        password: 'fixture',
        stratum_configs: [
            {pool: 'stratum+tcp://pool.invalid:3333', address: 'wallet', worker: '', password: ''},
            {pool: '', address: '', worker: '', password: ''},
            {pool: '', address: '', worker: '', password: ''},
        ],
    };
    return {config, requests};
}

function findApply(element) {
    if (typeof element?.props?.children === 'string' && element.props.children.startsWith('Apply')) return element;
    for (const child of React.Children.toArray(element?.props?.children)) {
        const button = findApply(child);
        if (button) return button;
    }
}

test('an empty worker permits Apply and preserves the normal miner command', async () => {
    const {config, requests} = createConfig();
    const button = findApply(config.render());
    assert.equal(button.props.disabled, false);
    await button.props.onClick();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].api, '/coin');
    assert.equal(requests[0].data.stratum_configs[0].worker, '');
    assert.deepEqual(requests[0].selected, [0]);
});

test('an empty worker also permits hashrate-split commands', async () => {
    const {config, requests} = createConfig();
    config.state.hashrate_split_enabled = true;
    config.state.hashrate_splits = [{coin: 'BTC', ratio: 100, stratum_configs: config.state.stratum_configs}];
    const button = findApply(config.render());
    assert.equal(button.props.disabled, false);
    await button.props.onClick();
    assert.equal(requests[0].api, '/hashratesplit');
    assert.equal(requests[0].data.hashrate_splits[0].stratum_configs[0].worker, '');
});

test('required pool, wallet, password, coin and miner selection still gate Apply', () => {
    for (const missing of ['pool', 'address', 'password', 'coin', 'selected']) {
        const {config} = createConfig();
        if (missing === 'pool' || missing === 'address') config.state.stratum_configs[0][missing] = '';
        else if (missing === 'password') config.state.password = '';
        else if (missing === 'coin') config.state.coin = 'Select Coin';
        else config.props.selected = [];
        assert.equal(Boolean(findApply(config.render()).props.disabled), true, missing);
    }
});
