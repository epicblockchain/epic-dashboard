export function getHashboardStatus(summary) {
    if (!summary || !Array.isArray(summary.HBStatus)) return [];

    const statuses = new Map();
    for (const status of summary.HBStatus) {
        if (!Number.isInteger(status?.Index) || status.Index < 0 || typeof status.Enabled !== 'boolean') continue;
        statuses.set(status.Index, {
            Index: status.Index,
            Enabled: status.Enabled,
            Detected: typeof status.Detected === 'boolean' ? status.Detected : null,
        });
    }

    return [...statuses.values()].sort((a, b) => a.Index - b.Index);
}

export function getSelectedBoardCount(data, selected) {
    let highestIndex = -1;

    for (const minerIndex of selected || []) {
        for (const status of getHashboardStatus(data?.[minerIndex]?.sum)) {
            highestIndex = Math.max(highestIndex, status.Index);
        }
    }

    return highestIndex + 1;
}

export function getModelBoardCount(data, model) {
    let boardCount = 0;

    for (const miner of data || []) {
        if (miner?.cap?.Model !== model) continue;
        const maxHashboards = Number(miner.cap['Max HBs']);
        if (Number.isInteger(maxHashboards) && maxHashboards > 0) boardCount = Math.max(boardCount, maxHashboards);
    }

    return boardCount;
}

export function resizeBoardStates(boardStates, boardCount, defaultEnabled = true) {
    return Array.from({length: Math.max(1, boardCount)}, (_, index) =>
        typeof boardStates?.[index] === 'boolean' ? boardStates[index] : defaultEnabled,
    );
}

export function copyBoardStates(summary, fallbackCount = 1) {
    const statuses = getHashboardStatus(summary);
    if (!statuses.length) return resizeBoardStates([], fallbackCount);

    const boardCount = Math.max(fallbackCount, statuses[statuses.length - 1].Index + 1);
    const states = Array(boardCount).fill(true);
    for (const status of statuses) states[status.Index] = status.Enabled;
    return states;
}

export function buildBoardEnableParam(boardStates, summary, maxHashboards) {
    const statuses = getHashboardStatus(summary);
    const modelBoardCount = Number(maxHashboards);
    const validIndexes =
        Number.isInteger(modelBoardCount) && modelBoardCount > 0
            ? new Set(Array.from({length: modelBoardCount}, (_, index) => index))
            : statuses.length
              ? new Set(statuses.map(({Index}) => Index))
              : null;

    return (boardStates || []).flatMap((enabled, Index) => {
        if (typeof enabled !== 'boolean' || (validIndexes && !validIndexes.has(Index))) return [];
        return [{Index, Data: enabled}];
    });
}

export function buildBoardEnableRequest(boardStates, summary, password, maxHashboards) {
    return {
        param: buildBoardEnableParam(boardStates, summary, maxHashboards),
        password,
    };
}
