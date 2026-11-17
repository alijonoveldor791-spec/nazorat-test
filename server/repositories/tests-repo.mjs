// repositories/tests-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
import { adaptTest } from '../migrations/legacy.mjs';
import { preserveOrigin } from './test-origin-repo.mjs';
import { fail } from '../lib/http.mjs';
const STORE = 'tests';
export const list = async (fresh = false) =>
  (await blobs.all(STORE, fresh)).map((row) => adaptTest(row, row.id));
export async function find(id) {
  const row = await blobs.get(STORE, id);
  return row ? adaptTest(row, id) : null;
}
export const ownerOf = (id) => blobs.owner(STORE, id);
export const save = async (row) => blobs.put(STORE, row.id, await preserveOrigin(row));
export const remove = (id) => blobs.remove(STORE, id);
export const clear = () => blobs.clearStore(STORE);
export const create = async (row) => blobs.create(STORE, row.id, await preserveOrigin(row));

export const update = async (id, change) => {
  const original = await find(id);
  if (original) await preserveOrigin(original);
  return blobs.update(STORE, id, (row) => {
    const result = change(row ? adaptTest(row, id) : null);
    if (
      row?.origin?.type === 'shared' &&
      (result.settings?.showAnswers || JSON.stringify(row.questions) !== JSON.stringify(result.questions))
    )
      fail("Umumiy test nusxasining savollari o'zgartirilmaydi.", 403);
    return { ...result, ...(row?.origin ? { origin: row.origin } : {}) };
  });
};
