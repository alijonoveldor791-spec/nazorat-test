// RBAC sinovlari uchun alohida xotira ombori; disk va haqiqiy Blobs ishlatilmaydi.
const STORES = new Map();
export function rawStore(name) {
  if (!STORES.has(name)) STORES.set(name, new Map());
  return STORES.get(name);
}
export const seed = (name, key, value) => rawStore(name).set(key, { value: structuredClone(value), etag: 1 });
export function getStore({ name }) {
  const rows = rawStore(name);
  return {
    async get(key) {
      return structuredClone(rows.get(key)?.value ?? null);
    },
    async getWithMetadata(key) {
      const row = rows.get(key);
      return row ? { data: structuredClone(row.value), etag: String(row.etag) } : null;
    },
    async setJSON(key, value, options = {}) {
      const previous = rows.get(key);
      if (options.onlyIfNew && previous) return { modified: false };
      if (options.onlyIfMatch && String(previous?.etag) !== options.onlyIfMatch) return { modified: false };
      rows.set(key, { value: structuredClone(value), etag: (previous?.etag || 0) + 1 });
      return { modified: true };
    },
    async delete(key) {
      rows.delete(key);
    },
    async *list({ prefix = '' } = {}) {
      yield { blobs: [...rows.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })) };
    },
  };
}
