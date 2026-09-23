import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildHashrateSeries} from '../src/dashboardData.mjs';

test('chart aggregation ignores malformed miner history and keeps valid samples', () => {
    const result = buildHashrateSeries([
        {hist: 'load'},
        {hist: {History: []}},
        {hist: null},
        {
            hist: [
                {Timestamp: 10, Hashrate: 1_000_000},
                {Timestamp: '10', Hashrate: 2_000_000},
                {Timestamp: 11, Hashrate: 'bad'},
                null,
            ],
        },
    ]);

    assert.deepEqual(result.chartHashrateData, [{time: new Date(10_000), hashrate: 3}]);
    assert.equal(result.totalHashrate, 3_000_000);
});

test('chart aggregation accepts a missing miner list', () => {
    assert.deepEqual(buildHashrateSeries(undefined), {chartHashrateData: [], totalHashrate: 0});
});
