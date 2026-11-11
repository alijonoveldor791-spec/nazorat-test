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
export const ownerOf = (id) => blobs.owner(STORE, id);
const summary = ({ questions, answers, publicResult, ...row }) => row;
export async function save(row) {
  await blobs.put(STORE, row.id, row);
  await blobs.put('result-summaries', row.id, summary(row));
}
export async function remove(id) {
  await blobs.remove(STORE, id);
  await blobs.remove('result-summaries', id);
}
export async function clear() {
  await blobs.clearStore(STORE);
  await blobs.clearStore('result-summaries');
}
export async function create(row) {
  const created = await blobs.create(STORE, row.id, row);
  if (created) await blobs.put('result-summaries', row.id, summary(row));
  return created;
}
export async function listSummaries() {
  const ids = await blobs.keys(STORE),
    rows = [];
  for (let offset = 0; offset < ids.length; offset += 16) {
    const batch = await Promise.all(
      ids.slice(offset, offset + 16).map(async (id) => {
        const light = await blobs.scopedEntry('result-summaries', id);
        if (light.exists) return light.value ? adaptResult(light.value, id) : null;
        const full = await find(id);
        return full ? summary(full) : null;
      })
    );
    rows.push(...batch.filter(Boolean));
  }
  return rows;
}
