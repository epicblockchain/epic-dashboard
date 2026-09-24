import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
    buildPerformancePresetAction,
    formatApiError,
    getCommonPerformancePresets,
    getPerformancePresetLabel,
    parseOpenApiProfile,
    supportsApiOperation,
} from '../src/apiCompatibility.mjs';

test('operation support follows advertised paths and methods without reading API version labels', () => {
    const profile = parseOpenApiProfile({
        info: {version: 'future-version'},
        paths: {
            '/summary': {get: {}},
            '/miners/{minerId}/settings': {patch: {}},
        },
    });

    assert.equal(supportsApiOperation(profile, '/summary', 'get'), true);
    assert.equal(supportsApiOperation(profile, '/summary', 'post'), false);
    assert.equal(supportsApiOperation(profile, '/miners/rig-42/settings', 'patch'), true);
    assert.equal(supportsApiOperation(profile, '/unlisted-operation', 'post'), null);
    assert.equal(supportsApiOperation(null, '/unlisted-operation', 'post'), null);
});

test('OpenAPI profiles reject malformed documents without depending on info metadata', () => {
    assert.equal(parseOpenApiProfile(null), null);
    assert.equal(parseOpenApiProfile({paths: []}), null);
    assert.deepEqual(parseOpenApiProfile({paths: {'/summary': {get: {}}}}), {
        paths: {'/summary': {get: {}}},
    });
});

test('API errors normalize arbitrary string, tagged, and message response shapes', () => {
    assert.equal(formatApiError('{"BadPassword":"Authentication failed"}'), 'Bad Password: Authentication failed');
    assert.equal(formatApiError('Unexpected device response'), 'Unexpected device response');
    assert.equal(
        formatApiError({code: 'InvalidNumberHashrateSplitConfig', message: 'Expected a number'}),
        'Invalid Number Hashrate Split Config: Expected a number',
    );
    assert.equal(formatApiError({InvalidUrl: ''}), 'Invalid Url');
    assert.equal(
        formatApiError({UnsupportedOperation: 'No change was sent.'}),
        'Unsupported Operation: No change was sent.',
    );
    assert.equal(formatApiError(null), 'Unknown API error');
});

test('documented Tune Presets populate compatible performance choices and use /tune', () => {
    const presets = getCommonPerformancePresets([
        {
            'Tune Presets': [
                {voltage: 13500, clk: 506, hashrate: 98, power: 3000},
                {voltage: 15000, clk: 700, hashrate: 135, power: null},
                {voltage: null, clk: 100, hashrate: 5},
            ],
        },
        {
            'Tune Presets': [
                {voltage: 13500, clk: 506, hashrate: 98, power: 3200},
                {voltage: 15000, clk: 700, hashrate: 135, power: null},
            ],
        },
    ]);

    assert.equal(presets.length, 2);
    assert.equal(presets[0].power, null);
    assert.equal(getPerformancePresetLabel(presets[0]), '98 TH/s · 506 MHz · 13.500 V');
    assert.deepEqual(buildPerformancePresetAction(presets[0]), {
        api: '/tune',
        data: {clock: 506, voltage: 13.5},
    });
});

test('presets absent or malformed in capabilities produce no performance actions', () => {
    assert.deepEqual(getCommonPerformancePresets([{otherCapability: []}]), []);
    assert.deepEqual(getCommonPerformancePresets([{'Tune Presets': [{clk: 'bad', voltage: 12000}]}]), []);
    assert.equal(buildPerformancePresetAction({clk: 500, voltage: Number.NaN}), null);
});

test('alternate capability preset shapes remain supported without version checks', () => {
    const presets = getCommonPerformancePresets([{PresetsPowerLevels: {Balanced: [2500, 3000]}}]);

    assert.deepEqual(presets[1], {type: 'mode', mode: 'Balanced', power: 3000});
    assert.deepEqual(buildPerformancePresetAction(presets[1]), {
        api: '/mode',
        data: {mode: 'Balanced', power: 3000},
    });
});
