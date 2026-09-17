import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
    buildBoardEnableParam,
    buildBoardEnableRequest,
    copyBoardStates,
    getHashboardStatus,
    getModelBoardCount,
    getSelectedBoardCount,
    resizeBoardStates,
} from '../src/boardControl.mjs';

const summary = {
    HBStatus: [
        {Index: 2, Enabled: true, Detected: true},
        {Index: 0, Enabled: true, Detected: true},
        {Index: 1, Enabled: false, Detected: true},
    ],
};

test('normalizes and sorts reported hashboard status', () => {
    assert.deepEqual(getHashboardStatus(summary), [
        {Index: 0, Enabled: true, Detected: true},
        {Index: 1, Enabled: false, Detected: true},
        {Index: 2, Enabled: true, Detected: true},
    ]);
});

test('uses the highest reported index for mixed board counts', () => {
    const data = [{sum: summary}, {sum: {HBStatus: [{Index: 8, Enabled: true, Detected: true}]}}];
    assert.equal(getSelectedBoardCount(data, [0]), 3);
    assert.equal(getSelectedBoardCount(data, [0, 1]), 9);
    assert.equal(getSelectedBoardCount(data, []), 0);
});

test('uses the capability maximum for every miner in a model', () => {
    const data = [
        {cap: {Model: 'AntMiner S19j Pro', 'Max HBs': 3}},
        {cap: {Model: 'AntMiner S19j Pro', 'Max HBs': 3}},
        {cap: {Model: 'Nine Board Rig', 'Max HBs': 9}},
    ];
    assert.equal(getModelBoardCount(data, 'AntMiner S19j Pro'), 3);
    assert.equal(getModelBoardCount(data, 'Nine Board Rig'), 9);
    assert.equal(getModelBoardCount(data, 'Unknown'), 0);
});

test('copies enabled states and preserves zero-based board indexes', () => {
    assert.deepEqual(copyBoardStates(summary), [true, false, true]);
    assert.deepEqual(copyBoardStates({HBStatus: [{Index: 0, Enabled: false, Detected: true}]}, 3), [false, true, true]);
    assert.deepEqual(resizeBoardStates([false], 3), [false, true, true]);
});

test('filters a bulk board command to indexes reported by each miner', () => {
    assert.deepEqual(buildBoardEnableParam([false, true, false, true], summary), [
        {Index: 0, Data: false},
        {Index: 1, Data: true},
        {Index: 2, Data: false},
    ]);
    assert.deepEqual(buildBoardEnableRequest([false, true], summary, 'secret'), {
        param: [
            {Index: 0, Data: false},
            {Index: 1, Data: true},
        ],
        password: 'secret',
    });
});

test('prefers the model maximum when building each miner request', () => {
    const incompleteSummary = {HBStatus: [{Index: 0, Enabled: true, Detected: true}]};
    assert.deepEqual(buildBoardEnableParam([true, false, true, false], incompleteSummary, 3), [
        {Index: 0, Data: true},
        {Index: 1, Data: false},
        {Index: 2, Data: true},
    ]);
});

test('keeps the configured pattern when a miner has no board metadata', () => {
    assert.deepEqual(buildBoardEnableParam([true, false], {}), [
        {Index: 0, Data: true},
        {Index: 1, Data: false},
    ]);
});
