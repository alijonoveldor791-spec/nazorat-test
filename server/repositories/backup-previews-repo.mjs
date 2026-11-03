// Tiklash preview holatini bir martalik server omborida saqlaydi.
import * as blobs from './blob-store.mjs';
export const save = (id, value) => blobs.create('backup-previews', id, value);
export const find = (id) => blobs.get('backup-previews', id);
export const update = (id, change) => blobs.update('backup-previews', id, change);
export const list = () => blobs.all('backup-previews', true);
