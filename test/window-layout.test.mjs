import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getInitialWindowBounds, getMinerTableBodyHeight} from '../src/windowLayout.mjs';

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

test('the virtualized table body uses the measured container height', () => {
    assert.equal(getMinerTableBodyHeight(720), 720);
    assert.equal(getMinerTableBodyHeight(320.8), 320);
    assert.equal(getMinerTableBodyHeight(0), 1);
    assert.equal(getMinerTableBodyHeight(-10), 1);
    assert.equal(getMinerTableBodyHeight(Number.NaN), 1);
});
