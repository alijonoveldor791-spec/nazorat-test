// repositories/attempts-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
export const listForIdentity = async (key) =>
  (await blobs.entries('attempts', key + '/')).map((row) => row.value);
export const find = (id) => blobs.get('attempts', id);
export const create = (row) => blobs.create('attempts', row.id, row);
export const save = (row) => blobs.put('attempts', row.id, row);
export const clear = () => blobs.clearStore('attempts');
