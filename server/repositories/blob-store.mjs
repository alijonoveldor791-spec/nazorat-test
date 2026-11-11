// repositories/blob-store.mjs: serverdagi shu qatlam vazifasi.
import { measuredStore } from '../lib/storage-metrics.mjs';
import { getStore } from '@netlify/blobs';
import { withKeyLock } from './write-lock.mjs';
import { currentAccess, ownsRow, ownedRow, stampRow } from '../lib/access-context.mjs';
import { fail } from '../lib/http.mjs';

const SCOPED_STORES = new Set([
  'classes',
  'tests',
  'results',
  'result-summaries',
  'attempts',
  'attempt-content',
  'pending-attempts',
  'retakes',
  'test-codes',
  'backup-archives',
  'backup-previews',
]);
const scoped = (name) => SCOPED_STORES.has(name);
async function assertRestoreLock(name) {
  if (!scoped(name)) return;
  const auth = currentAccess(),
    scope = auth?.schoolId || (auth?.role === 'legacy_admin' ? 'legacy' : null);
  if (auth?.restoreOperationId && auth?.restoreClaimId) return;
  if (!scope) return;
  const lock = await store('backup-locks').get(scope, { type: 'json' });
  if (lock?.until > Date.now() && lock.operationId !== auth.restoreOperationId)
    fail("Maktab ma'lumotlari tiklanmoqda.", 409);
}

const caches = new Map();
export const store = (name) => measuredStore(getStore({ name, consistency: 'strong' }));
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
export async function owner(name, key) {
  const row = await store(name).get(key, { type: 'json' });
  return row ? { exists: true, schoolId: row.schoolId || null } : { exists: false, schoolId: null };
}
export async function put(name, key, value) {
  await assertRestoreLock(name);
  if (scoped(name)) return update(name, key, () => value);
  await store(name).setJSON(key, value);
  caches.delete(name);
}
export async function create(name, key, value) {
  await assertRestoreLock(name);
  if (scoped(name)) value = stampRow(value);
  return withKeyLock(name + '/' + key, async () => {
    const result = await store(name).setJSON(key, value, { onlyIfNew: true });
    caches.delete(name);
    return result.modified;
  });
}
export async function update(name, key, change, { skipUnchanged = false } = {}) {
  await assertRestoreLock(name);
  return withKeyLock(name + '/' + key, async () => {
    for (let i = 0; i < 120; i++) {
      const previous = await store(name).getWithMetadata(key, { type: 'json' });
      if (scoped(name) && previous) ownedRow(previous.data);
      const changed = change(previous?.data ?? null);
      if (skipUnchanged && previous && changed === previous.data) return previous.data;
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
  await assertRestoreLock(name);
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

export async function keys(name, prefix) {
  const keys = [];
  for await (const { blobs } of store(name).list({ paginate: true, ...(prefix ? { prefix } : {}) }))
    keys.push(...blobs.map((b) => b.key));
  return keys;
}

export async function scopedEntry(name, key) {
  const row = await store(name).get(key, { type: 'json' });
  return { exists: !!row, value: !scoped(name) || ownsRow(row) ? row : null };
}
