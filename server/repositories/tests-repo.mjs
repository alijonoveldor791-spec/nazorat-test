// repositories/tests-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
import { adaptTest } from '../migrations/legacy.mjs';
const STORE = 'tests';
export const list = async (fresh = false) =>
  (await blobs.all(STORE, fresh)).map((row) => adaptTest(row, row.id));
export async function find(id) {
  const row = await blobs.get(STORE, id);
  return row ? adaptTest(row, id) : null;
}
export const save = (row) => blobs.put(STORE, row.id, row);
export const remove = (id) => blobs.remove(STORE, id);
export const clear = () => blobs.clearStore(STORE);
