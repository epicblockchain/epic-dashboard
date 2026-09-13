import got from 'got';

export async function minerRequest(url, options) {
    const {body} = await got(url, options);
    // Got responses contain sockets and other objects that cannot cross Electron IPC.
    return {body};
}
