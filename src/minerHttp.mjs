import got from 'got';
import {normalizeApiPath, parseOpenApiProfile, supportsApiOperation} from './apiCompatibility.mjs';

const apiProfiles = new Map();
const apiProfileCacheDuration = 5 * 60 * 1000;

async function getApiProfile(origin) {
    const cached = apiProfiles.get(origin);
    if (cached && cached.expiresAt > Date.now()) return cached.promise;

    const entry = {expiresAt: Date.now() + apiProfileCacheDuration, promise: null};
    entry.promise = (async () => {
        try {
            const {body} = await got(`${origin}/openapi.json`, {
                responseType: 'json',
                timeout: {request: 3000},
                retry: {limit: 0},
            });
            return parseOpenApiProfile(body);
        } catch {
            // Older APIs may not publish an OpenAPI document. In that case the
            // actual request remains the source of truth.
            return null;
        }
    })();

    apiProfiles.set(origin, entry);
    return entry.promise;
}

export async function minerRequest(url, options) {
    const requestUrl = new URL(url);
    const method = String(options?.method || 'GET').toLowerCase();

    if (
        ['post', 'put', 'patch', 'delete'].includes(method) &&
        normalizeApiPath(requestUrl.pathname) !== '/openapi.json'
    ) {
        const origin = requestUrl.origin;
        const profile = await getApiProfile(origin);
        if (supportsApiOperation(profile, requestUrl.pathname, method) === false) {
            return {
                body: {
                    result: false,
                    error: {
                        UnsupportedOperation: `The miner does not advertise ${method.toUpperCase()} ${normalizeApiPath(requestUrl.pathname)} in its OpenAPI document. No change was sent.`,
                    },
                },
            };
        }
    }

    const {body} = await got(url, options);
    // Got responses contain sockets and other objects that cannot cross Electron IPC.
    return {body};
}
