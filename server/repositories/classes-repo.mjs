// repositories/classes-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';

const STORE = 'classes';
export const list = async (fresh = false) => blobs.all(STORE, fresh);
export async function find(id) {
  const row = await blobs.get(STORE, id);
  return row ? { ...row, id: row.id || id } : null;
}
export const save = (row) => blobs.put(STORE, row.id, row);
export const remove = (id) => blobs.remove(STORE, id);
export const clear = () => blobs.clearStore(STORE);
