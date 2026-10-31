// repositories/blob-store.mjs: serverdagi shu qatlam vazifasi.
import { getStore } from '@netlify/blobs';
import { withKeyLock } from './write-lock.mjs';

const caches = new Map();
export const store = (name) => getStore({ name, consistency: 'strong' });
export async function entries(name, prefix) {
  const out = [];
  for await (const { blobs } of store(name).list({ paginate: true, ...(prefix ? { prefix } : {}) })) {
    const values = await Promise.all(
      blobs.map(async (b) => ({ key: b.key, value: await store(name).get(b.key, { type: 'json' }) }))
    );
    out.push(...values.filter((x) => x.value));
  }
  return out;
}
export const get = (name, key) => store(name).get(key, { type: 'json' });
export async function put(name, key, value) {
  await store(name).setJSON(key, value);
  caches.delete(name);
}
export async function create(name, key, value) {
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
      const value = change(previous?.data ?? null);
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
    const error = new Error('Bir vaqtda ko’p o’zgarish. Qayta urinib ko’ring.');
    error.status = 409;
    throw error;
  });
}
export async function remove(name, key) {
  await store(name).delete(key);
  caches.delete(name);
}
export function invalidate() {
  caches.clear();
}
export async function all(name, fresh = false) {
  const cached = caches.get(name);
  if (!fresh && cached && cached.until > Date.now()) return structuredClone(cached.value);
  const rows = await entries(name);
  const value = rows.map(({ key, value }) => ({ ...value, id: value.id || key }));
  if (name === 'tests' || name === 'classes') caches.set(name, { until: Date.now() + 5000, value });
  return structuredClone(value);
}
export async function clearStore(name) {
  const rows = await entries(name);
  await Promise.all(rows.map((r) => remove(name, r.key)));
}
