export function parseOpenApiProfile(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    if (!value.paths || typeof value.paths !== 'object' || Array.isArray(value.paths)) return null;

    return {paths: value.paths};
}

export function supportsApiOperation(profile, path, method = 'get') {
    if (!profile || typeof profile !== 'object' || !profile.paths) return null;

    const normalizedPath = normalizeApiPath(path);
    const documentedPath = Object.hasOwn(profile.paths, normalizedPath)
        ? normalizedPath
        : Object.keys(profile.paths).find((candidate) => apiPathMatches(candidate, normalizedPath));
    // A missing path can mean the document is incomplete. A documented path
    // without the requested method is explicit evidence that the method is unsupported.
    if (!documentedPath) return null;

    const operation = profile.paths[documentedPath]?.[String(method).toLowerCase()];
    return Boolean(operation && typeof operation === 'object');
}

export function normalizeApiPath(path) {
    const value = String(path || '');
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
        return value.split('?')[0].replace(/\/$/, '') || '/';
    }

    try {
        const pathname = new URL(value).pathname;
        return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    } catch {
        return value.split('?')[0].replace(/\/$/, '') || '/';
    }
}

function apiPathMatches(documentedPath, requestPath) {
    const documented = normalizeApiPath(documentedPath);
    if (documented === requestPath) return true;

    const expression = documented
        .split('/')
        .map((segment) => (/^\{[^/]+\}$/.test(segment) ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        .join('/');
    return new RegExp(`^${expression}$`).test(requestPath);
}

function humanizeErrorCode(code) {
    return String(code)
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim();
}

function normalizeApiError(error) {
    if (error == null) return 'Unknown API error';

    if (typeof error === 'string') {
        const value = error.trim();
        if (!value) return 'Unknown API error';

        try {
            const parsed = JSON.parse(value);
            if (parsed !== value) return normalizeApiError(parsed);
        } catch {
            // Keep plain text errors intact.
        }

        return value;
    }

    if (Array.isArray(error)) {
        const messages = error.map(normalizeApiError).filter(Boolean);
        return messages.length ? messages.join('; ') : 'Unknown API error';
    }

    if (typeof error === 'object') {
        const entries = Object.entries(error);
        if (entries.length === 0) return 'Unknown API error';

        const message = error.message ?? error.detail ?? error.description;
        const code = error.code ?? error.type ?? error.name;
        if (message != null || code != null) {
            const readableMessage = message == null ? '' : normalizeApiError(message);
            const readableCode = code == null ? '' : humanizeErrorCode(code);
            if (!readableCode) return readableMessage || 'Unknown API error';
            if (!readableMessage || readableMessage.toLowerCase() === readableCode.toLowerCase()) return readableCode;
            return `${readableCode}: ${readableMessage}`;
        }

        return entries
            .map(([key, value]) => {
                const readableKey = humanizeErrorCode(key);
                if (value == null || value === '') return readableKey;
                if (typeof value === 'string' && value.trim()) {
                    if (value.trim().toLowerCase() === readableKey.toLowerCase()) return readableKey;
                    return `${readableKey}: ${value.trim()}`;
                }
                if (typeof value === 'object') return `${readableKey}: ${normalizeApiError(value)}`;
                return `${readableKey}: ${String(value)}`;
            })
            .join('; ');
    }

    return String(error);
}

export function formatApiError(error) {
    return normalizeApiError(error);
}

export function getPerformancePresets(capabilities) {
    const tunePresets = capabilities?.['Tune Presets'];
    if (Array.isArray(tunePresets)) {
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
                    preset.hashrate != null && Number.isFinite(Number(preset.hashrate))
                        ? Number(preset.hashrate)
                        : null,
                power: preset.power != null && Number.isFinite(Number(preset.power)) ? Number(preset.power) : null,
            }));
    }

    const powerLevels = capabilities?.PresetsPowerLevels;
    if (powerLevels && typeof powerLevels === 'object' && !Array.isArray(powerLevels)) {
        return Object.entries(powerLevels).flatMap(([mode, powers]) =>
            (Array.isArray(powers) ? powers : [powers])
                .filter((power) => power != null && Number.isFinite(Number(power)))
                .map((power) => ({type: 'mode', mode, power: Number(power)})),
        );
    }

    const modePresets = capabilities?.Presets;
    if (modePresets && typeof modePresets === 'object' && !Array.isArray(modePresets)) {
        return Object.values(modePresets)
            .filter((mode) => typeof mode === 'string' && mode.trim())
            .map((mode) => ({type: 'mode', mode, power: null}));
    }

    return [];
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
