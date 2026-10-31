// repositories/results-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
import { adaptResult } from '../migrations/legacy.mjs';
const STORE = 'results';
export const list = async (fresh = false) =>
  (await blobs.all(STORE, fresh)).map((row) => adaptResult(row, row.id));
export async function find(id) {
  const row = await blobs.get(STORE, id);
  return row ? adaptResult(row, id) : null;
}
export const save = (row) => blobs.put(STORE, row.id, row);
export const remove = (id) => blobs.remove(STORE, id);
export const clear = () => blobs.clearStore(STORE);
export const create = (row) => blobs.create(STORE, row.id, row);
