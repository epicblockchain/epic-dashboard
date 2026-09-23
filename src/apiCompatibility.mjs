const optionalApiOperations = {
    '/preinitcooldownmaxduration': 'Pre-init cooldown settings',
    '/perpetualtune/errorthrottle': 'Perpetual Tune error throttle',
};

const legacyUnsupportedOperations = new Set(Object.keys(optionalApiOperations));

export const LEGACY_API_PROFILE = Object.freeze({legacy: true, paths: Object.freeze({})});

const knownApiErrors = {
    MissingParam: 'Missing required parameter',
    BadPassword: 'Authentication failed',
    InvalidMethod: 'Invalid API method',
    InvalidUrl: 'Invalid URL: this API operation is unsupported by this miner version',
};

export function parseOpenApiProfile(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    if (!value.paths || typeof value.paths !== 'object' || Array.isArray(value.paths)) return null;

    return {
        version: typeof value.info?.version === 'string' ? value.info.version : null,
        paths: value.paths,
    };
}

export function getOptionalApiOperationName(path) {
    return optionalApiOperations[path] || null;
}

export function supportsApiOperation(profile, path, method = 'post') {
    if (!profile || typeof profile !== 'object') return null;
    if (profile.legacy) return legacyUnsupportedOperations.has(path) ? false : null;

    const operation = profile.paths?.[path]?.[String(method).toLowerCase()];
    return Boolean(operation && typeof operation === 'object');
}

function normalizeApiError(error) {
    if (error == null) return 'Unknown API error';

    if (typeof error === 'string') {
        const value = error.trim();
        if (!value) return 'Unknown API error';

        if (value.startsWith('{') && value.endsWith('}')) {
            try {
                return normalizeApiError(JSON.parse(value));
            } catch {
                // Preserve a server message when it is not a JSON object.
            }
        }

        return knownApiErrors[value] || value;
    }

    if (typeof error === 'object' && !Array.isArray(error)) {
        const entries = Object.entries(error);
        if (entries.length === 1) {
            const [code, detail] = entries[0];
            const message = knownApiErrors[code] || code;
            if (typeof detail === 'string' && detail.trim()) {
                if (detail.trim() === message || detail.trim() === code) return message;
                return `${message}: ${detail.trim()}`;
            }
            if (detail != null && typeof detail !== 'object' && detail !== '') {
                return `${message}: ${String(detail)}`;
            }
            return message;
        }

        return JSON.stringify(error);
    }

    return String(error);
}

export function formatApiError(error) {
    return normalizeApiError(error);
}

export function getPerformancePresets(capabilities) {
    if (!capabilities || typeof capabilities !== 'object') return [];

    const powerLevels = capabilities.PresetsPowerLevels;
    if (powerLevels && typeof powerLevels === 'object' && !Array.isArray(powerLevels)) {
        return Object.entries(powerLevels).flatMap(([mode, powers]) =>
            (Array.isArray(powers) ? powers : [powers])
                .filter((power) => power != null && Number.isFinite(Number(power)))
                .map((power) => ({type: 'mode', mode, power: Number(power)})),
        );
    }

    const legacyPresets = capabilities.Presets;
    if (legacyPresets && typeof legacyPresets === 'object' && !Array.isArray(legacyPresets)) {
        return Object.values(legacyPresets)
            .filter((mode) => typeof mode === 'string' && mode.trim())
            .map((mode) => ({type: 'mode', mode, power: null}));
    }

    const tunePresets = capabilities['Tune Presets'];
    if (!Array.isArray(tunePresets)) return [];

    return tunePresets
        .filter(
            (preset) =>
                preset &&
                typeof preset === 'object' &&
                preset.clk != null &&
                preset.voltage != null &&
                Number.isFinite(Number(preset.clk)) &&
                Number.isFinite(Number(preset.voltage)),
        )
        .map((preset) => ({
            type: 'tune',
            clk: Number(preset.clk),
            voltage: Number(preset.voltage),
            hashrate:
                preset.hashrate != null && Number.isFinite(Number(preset.hashrate)) ? Number(preset.hashrate) : null,
            power: preset.power != null && Number.isFinite(Number(preset.power)) ? Number(preset.power) : null,
        }));
}

function getPresetKey(preset) {
    return preset.type === 'tune'
        ? `tune:${preset.clk}:${preset.voltage}`
        : `mode:${preset.mode}:${preset.power ?? ''}`;
}

export function getCommonPerformancePresets(capabilitiesList) {
    if (!Array.isArray(capabilitiesList) || capabilitiesList.length === 0) return [];

    const lists = capabilitiesList.map(getPerformancePresets);
    if (lists.some((list) => list.length === 0)) return [];
    const type = lists[0][0]?.type;
    if (!type || lists.some((list) => list.some((preset) => preset.type !== type))) return [];

    const sharedLists = lists.slice(1);
    return lists[0]
        .filter((preset) =>
            sharedLists.every((list) => list.some((candidate) => getPresetKey(candidate) === getPresetKey(preset))),
        )
        .map((preset) => {
            if (preset.type !== 'tune') return preset;

            const matchingPresets = sharedLists.map((list) =>
                list.find((candidate) => getPresetKey(candidate) === getPresetKey(preset)),
            );
            return {
                ...preset,
                hashrate: matchingPresets.every((candidate) => candidate.hashrate === preset.hashrate)
                    ? preset.hashrate
                    : null,
                power: matchingPresets.every((candidate) => candidate.power === preset.power) ? preset.power : null,
            };
        });
}

export function getPerformancePresetLabel(preset) {
    if (preset.type === 'mode') return `${preset.mode}${preset.power ? ` @ ${preset.power}W` : ''}`;

    const labelParts = [];
    if (preset.hashrate != null) labelParts.push(`${preset.hashrate} TH/s`);
    labelParts.push(`${preset.clk} MHz`, `${(preset.voltage / 1000).toFixed(3)} V`);
    if (preset.power != null) labelParts.push(`${preset.power} W`);
    return labelParts.join(' · ');
}

export function buildPerformancePresetAction(preset) {
    if (!preset || typeof preset !== 'object') return null;
    if (preset.type === 'tune') {
        if (!Number.isFinite(preset.clk) || !Number.isFinite(preset.voltage)) return null;
        return {api: '/tune', data: {clock: preset.clk, voltage: preset.voltage / 1000}};
    }
    if (preset.type === 'mode' && typeof preset.mode === 'string') {
        return {api: '/mode', data: {mode: preset.mode, power: preset.power || ''}};
    }
    return null;
}
