// repositories/blob-store.mjs: serverdagi shu qatlam vazifasi.
import { getStore } from '@netlify/blobs';
import { withKeyLock } from './write-lock.mjs';
import { ownsRow, ownedRow, stampRow } from '../lib/access-context.mjs';

const SCOPED_STORES = new Set([
  'classes',
  'tests',
  'results',
  'attempts',
  'attempt-starts',
  'import-sources',
  'pending-attempts',
  'retakes',
  'test-codes',
]);
const scoped = (name) => SCOPED_STORES.has(name);

const caches = new Map();
export const store = (name) => getStore({ name, consistency: 'strong' });
export async function entries(name, prefix) {
  const out = [];
  for await (const { blobs } of store(name).list({ paginate: true, ...(prefix ? { prefix } : {}) })) {
    const values = await Promise.all(
      blobs.map(async (b) => ({ key: b.key, value: await store(name).get(b.key, { type: 'json' }) }))
    );
    out.push(...values.filter((x) => x.value && (!scoped(name) || ownsRow(x.value))));
  }
  return out;
}
export async function get(name, key) {
  const row = await store(name).get(key, { type: 'json' });
  return !scoped(name) || ownsRow(row) ? row : null;
}
export async function put(name, key, value) {
  if (scoped(name)) return update(name, key, () => value);
  await store(name).setJSON(key, value);
  caches.delete(name);
}
export async function create(name, key, value) {
  if (scoped(name)) value = stampRow(value);
  return withKeyLock(name + '/' + key, async () => {
    const result = await store(name).setJSON(key, value, { onlyIfNew: true });
    caches.delete(name);
    return result.modified;
  });
}
export async function update(name, key, change) {
  return withKeyLock(name + '/' + key, async () => {
    for (let i = 0; i < 120; i++) {
      const previous = await store(name).getWithMetadata(key, { type: 'json' });
      if (scoped(name) && previous) ownedRow(previous.data);
      const changed = change(previous?.data ?? null);
      const value = scoped(name) ? stampRow(changed) : changed;
      const result = await store(name).setJSON(
        key,
        value,
        previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true }
      );
      if (result.modified) {
        caches.delete(name);
        return value;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 20)));
    }
    const error = new Error("Bir vaqtda ko'p o'zgarish. Qayta urinib ko'ring.");
    error.status = 409;
    throw error;
  });
}
export async function remove(name, key) {
  if (scoped(name)) {
    const row = await store(name).getWithMetadata(key, { type: 'json' });
    if (!row) return;
    ownedRow(row.data);
  }
  await store(name).delete(key);
  caches.delete(name);
}
export function invalidate() {
  caches.clear();
}
export async function all(name, fresh = false) {
  const cached = caches.get(name);
  if (!scoped(name) && !fresh && cached && cached.until > Date.now()) return structuredClone(cached.value);
  const rows = await entries(name);
  const value = rows.map(({ key, value }) => ({ ...value, id: value.id || key }));
  if (!scoped(name)) caches.set(name, { until: Date.now() + 5000, value });
  return structuredClone(value);
}
export async function clearStore(name) {
  const rows = await entries(name);
  await Promise.all(rows.map((r) => remove(name, r.key)));
}
