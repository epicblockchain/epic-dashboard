import {openAsBlob} from 'node:fs';
import path from 'node:path';
import sha256 from 'sha256-file';
import {FormDataEncoder} from 'form-data-encoder';

export async function createFirmwareUpload(api, data) {
    const field = api === '/update' ? 'swupdate.swu' : api === '/systemupdate' ? 'update.zip' : null;
    if (!field) throw new Error(`Unsupported firmware endpoint: ${api}`);

    const form = new FormData();
    form.append('password', data.password);
    form.append('checksum', sha256(data.filepath));
    form.append('keepsettings', data.keep.toString());
    const type = api === '/systemupdate' ? 'application/zip' : 'application/octet-stream';
    form.append(field, await openAsBlob(data.filepath, {type}), path.basename(data.filepath));

    // Preserve streaming uploads and Content-Length, which the miner's upload handler may require.
    const encoder = new FormDataEncoder(form);
    return {body: encoder.encode(), headers: encoder.headers};
}
