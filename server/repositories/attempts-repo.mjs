// repositories/attempts-repo.mjs: serverdagi shu qatlam vazifasi.
import * as content from './attempt-content-repo.mjs';
import { ownsRow, currentAccess } from '../lib/access-context.mjs';
import * as blobs from './blob-store.mjs';
export const listForIdentity = async (key) =>
  (await blobs.entries('attempts', key + '/')).map((row) => row.value);
export const findState = (id) => blobs.get('attempts', id);
export const find = async (id) => content.hydrate(await findState(id));
const pendingKey = (row) =>
  `v2/${row.schoolId || currentAccess()?.schoolId || 'legacy'}/${row.testId}/${row.deadline ? Date.parse(row.deadline) : row.expires}/${row.id}`;
async function index(row, previous) {
  if (previous && pendingKey(previous) !== pendingKey(row))
    await blobs.remove('pending-attempts', pendingKey(previous));
  if (row.finished) {
    await blobs.remove('pending-attempts', pendingKey(row));
    await blobs.remove('pending-attempts', row.id);
    return;
  }
  await blobs.put('pending-attempts', pendingKey(row), {
    id: row.id,
    testId: row.testId,
    end: row.deadline ? Date.parse(row.deadline) : row.expires,
  });
}
export async function create(row) {
  const state = content.compact(row, await content.reserve(row));
  const created = await blobs.create('attempts', row.id, state);
  if (created) await index(state);
  return created;
}
export async function save(row) {
  await blobs.put('attempts', row.id, row);
  await index(row);
}
export async function update(id, change) {
  let previous;
  const row = await blobs.update(
    'attempts',
    id,
    (current) => {
      previous = current;
      return change(current);
    },
    { skipUnchanged: true }
  );
  if (
    !previous ||
    previous.finished !== row.finished ||
    previous.deadline !== row.deadline ||
    previous.expires !== row.expires ||
    previous.testId !== row.testId
  )
    await index(row, previous);
  return row;
}
export const listDue = async (now) => (await listPending()).filter((row) => row.end <= now);
export async function listPending() {
  const out = [],
    legacy = [];
  for (const key of await blobs.keys('pending-attempts')) {
    const match = /^v2\/([^/]+)\/([^/]+)\/(\d+)\/(.+)$/.exec(key);
    if (!match) {
      legacy.push(key);
      continue;
    }
    const row = {
      schoolId: match[1] === 'legacy' ? null : match[1],
      testId: match[2],
      end: Number(match[3]),
      id: match[4],
      pendingKey: key,
    };
    if (ownsRow(row)) out.push(row);
  }
  for (let offset = 0; offset < legacy.length; offset += 16) {
    const batch = await Promise.all(
      legacy.slice(offset, offset + 16).map(async (key) => {
        const row = await blobs.get('pending-attempts', key);
        return row ? { ...row, pendingKey: key } : null;
      })
    );
    out.push(...batch.filter(Boolean));
  }
  return out;
}
export const removePending = (id, key = id) => blobs.remove('pending-attempts', key);
export async function clear() {
  await blobs.clearStore('attempts');
  await content.clear();
  await blobs.clearStore('pending-attempts');
}
