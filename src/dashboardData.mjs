export function buildHashrateSeries(data) {
    const hashrateData = {};

    for (const miner of Array.isArray(data) ? data : []) {
        if (!Array.isArray(miner?.hist)) continue;

        for (const sample of miner.hist) {
            if (sample?.Timestamp == null || sample?.Hashrate == null) continue;

            const timestamp = Number(sample.Timestamp);
            const hashrate = Number(sample.Hashrate);
            if (!Number.isFinite(timestamp) || !Number.isFinite(hashrate)) continue;

            if (!(timestamp in hashrateData)) hashrateData[timestamp] = hashrate;
            else hashrateData[timestamp] += hashrate;
        }
    }

    let totalHashrate = 0;
    const chartHashrateData = Object.keys(hashrateData).map((seconds) => {
        const hashrate = hashrateData[seconds];
        totalHashrate += hashrate;
        return {time: new Date(Number(seconds) * 1000), hashrate: hashrate / 1000000};
    });

    return {chartHashrateData, totalHashrate};
}
