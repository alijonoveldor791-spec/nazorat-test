// repositories/retakes-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
export const find = (key) => blobs.get('retakes', key);
export const grant = (key) => blobs.update('retakes', key, (row) => ({ extra: (row?.extra || 0) + 1 }));
export const clear = () => blobs.clearStore('retakes');
