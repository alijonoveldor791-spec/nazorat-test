// In-memory store mock replacing @netlify/blobs for Node.js runtime.
const STORES = new Map();

function cloneJson(value) {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

export function getStore(options) {
  const name = typeof options === 'string' ? options : options?.name || 'default';
  let store = STORES.get(name);
  if (!store) {
    store = new Map();
    STORES.set(name, store);
  }
  return {
    async get(key, getOptions) {
      const entry = store.get(key);
      if (!entry) return null;
      return getOptions?.type === 'json' ? cloneJson(entry.data) : entry.data;
    },
    async getWithMetadata(key, getOptions) {
      const entry = store.get(key);
      if (!entry) return null;
      return {
        data: getOptions?.type === 'json' ? cloneJson(entry.data) : entry.data,
        etag: entry.etag,
        metadata: entry.metadata || {},
      };
    },
    async setJSON(key, value, setOptions = {}) {
      const existing = store.get(key);
      if (setOptions.onlyIfNew && existing) return { modified: false };
      if (setOptions.onlyIfMatch && (!existing || existing.etag !== setOptions.onlyIfMatch)) {
        return { modified: false };
      }
      const seq = (existing?.seq || 0) + 1;
      const etag = `${seq}-${Math.random().toString(36).slice(2, 10)}`;
      store.set(key, {
        data: cloneJson(value),
        etag,
        seq,
        metadata: setOptions.metadata || {},
      });
      return { modified: true, etag };
    },
    async delete(key) {
      store.delete(key);
    },
    async *list(listOptions = {}) {
      const prefix = listOptions.prefix || '';
      const blobs = [];
      for (const [key, entry] of store.entries()) {
        if (!prefix || key.startsWith(prefix)) blobs.push({ key, etag: entry.etag });
      }
      yield { blobs };
    },
  };
}
