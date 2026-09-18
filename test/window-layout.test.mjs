import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getInitialWindowBounds, getMinerTableViewportHeight} from '../src/windowLayout.mjs';

test('the app starts at 1280x720 without exceeding the display work area', () => {
    assert.deepEqual(getInitialWindowBounds({width: 1920, height: 1080}), {
        width: 1280,
        minWidth: 800,
        height: 720,
        minHeight: 620,
    });
    assert.deepEqual(getInitialWindowBounds({width: 1280, height: 680}), {
        width: 1280,
        minWidth: 800,
        height: 680,
        minHeight: 620,
    });
    assert.deepEqual(getInitialWindowBounds({width: 700, height: 500}), {
        width: 700,
        minWidth: 700,
        height: 500,
        minHeight: 500,
    });
});

test('the miner table reserves enough settings space across common window heights', () => {
    assert.equal(getMinerTableViewportHeight(720), 200);
    assert.equal(getMinerTableViewportHeight(620), 140);
    assert.equal(getMinerTableViewportHeight(1080), 560);
    assert.equal(getMinerTableViewportHeight(1100), 580);
    assert.equal(getMinerTableViewportHeight(1440), 920);
});
