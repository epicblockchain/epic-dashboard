import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
    buildPerformancePresetAction,
    formatApiError,
    getCommonPerformancePresets,
    getPerformancePresetLabel,
    parseOpenApiProfile,
    supportsApiOperation,
    LEGACY_API_PROFILE,
} from '../src/apiCompatibility.mjs';

const api122 = parseOpenApiProfile({
    info: {version: '1.22.5'},
    paths: {'/summary': {get: {}}, '/tune': {post: {}}},
});
const api130 = parseOpenApiProfile({
    info: {version: '1.30.0'},
    paths: {
        '/summary': {get: {}},
        '/preinitcooldownmaxduration': {post: {}},
    },
});
const api138 = parseOpenApiProfile({
    info: {version: '1.38.3'},
    paths: {
        '/summary': {get: {}},
        '/preinitcooldownmaxduration': {post: {}},
        '/perpetualtune/errorthrottle': {post: {}},
        '/tune/withpowerlimit': {post: {}},
    },
});

test('API operation support follows the advertised OpenAPI paths across versions', () => {
    assert.equal(supportsApiOperation(api122, '/preinitcooldownmaxduration'), false);
    assert.equal(supportsApiOperation(api122, '/perpetualtune/errorthrottle'), false);
    assert.equal(supportsApiOperation(api130, '/preinitcooldownmaxduration'), true);
    assert.equal(supportsApiOperation(api130, '/perpetualtune/errorthrottle'), false);
    assert.equal(supportsApiOperation(api138, '/perpetualtune/errorthrottle'), true);
    assert.equal(supportsApiOperation(api138, '/tune/withpowerlimit'), true);
});

test('legacy APIs without OpenAPI metadata skip endpoints absent from the 1.22 spec', () => {
    assert.equal(supportsApiOperation(LEGACY_API_PROFILE, '/preinitcooldownmaxduration'), false);
    assert.equal(supportsApiOperation(LEGACY_API_PROFILE, '/perpetualtune/errorthrottle'), false);
    assert.equal(supportsApiOperation(LEGACY_API_PROFILE, '/tune'), null);
    assert.equal(supportsApiOperation(null, '/perpetualtune/errorthrottle'), null);
});

test('OpenAPI profiles reject malformed responses and tolerate missing version labels', () => {
    assert.equal(parseOpenApiProfile(null), null);
    assert.equal(parseOpenApiProfile({paths: []}), null);
    assert.deepEqual(parseOpenApiProfile({paths: {'/summary': {get: {}}}}), {
        version: null,
        paths: {'/summary': {get: {}}},
    });
});

test('API errors normalize legacy JSON strings and newer tagged response values', () => {
    assert.equal(formatApiError('{"BadPassword":"Authentication failed"}'), 'Authentication failed');
    assert.equal(formatApiError('BadPassword'), 'Authentication failed');
    assert.equal(
        formatApiError({InvalidUrl: ''}),
        'Invalid URL: this API operation is unsupported by this miner version',
    );
    assert.equal(formatApiError({InvalidNumberHashrateSplitConfig: 3}), 'InvalidNumberHashrateSplitConfig: 3');
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

test('legacy performance presets retain the /mode request', () => {
    const presets = getCommonPerformancePresets([{PresetsPowerLevels: {Balanced: [2500, 3000]}}]);

    assert.deepEqual(presets[1], {type: 'mode', mode: 'Balanced', power: 3000});
    assert.deepEqual(buildPerformancePresetAction(presets[1]), {
        api: '/mode',
        data: {mode: 'Balanced', power: 3000},
    });
});
