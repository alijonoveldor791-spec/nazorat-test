// repositories/attempts-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
export const listForIdentity = async (key) =>
  (await blobs.entries('attempts', key + '/')).map((row) => row.value);
export const find = (id) => blobs.get('attempts', id);
async function index(row) {
  if (row.finished) return blobs.remove('pending-attempts', row.id);
  await blobs.put('pending-attempts', row.id, {
    id: row.id,
    testId: row.testId,
    end: row.deadline ? Date.parse(row.deadline) : row.expires,
  });
}
export async function create(row) {
  const created = await blobs.create('attempts', row.id, row);
  if (created) await index(row);
  return created;
}
export async function save(row) {
  await blobs.put('attempts', row.id, row);
  await index(row);
}
export async function update(id, change) {
  const row = await blobs.update('attempts', id, change);
  await index(row);
  return row;
}
export const listDue = async (now) =>
  (await blobs.entries('pending-attempts')).map((row) => row.value).filter((row) => row.end <= now);
export const listPending = async () => (await blobs.entries('pending-attempts')).map((row) => row.value);
export const removePending = (id) => blobs.remove('pending-attempts', id);
export async function clear() {
  await blobs.clearStore('attempts');
  await blobs.clearStore('pending-attempts');
}
