// Ixtiyoriy yuklama diagnostikasida bitta so'rovning Blobs amallarini hisoblaydi.
import { AsyncLocalStorage } from 'node:async_hooks';
import { env } from './env.mjs';
const CONTEXT = new AsyncLocalStorage();
export async function withStorageMetrics(action) {
  if (env('LOAD_DIAGNOSTICS') !== 'true') return action();
  const metrics = { read: 0, write: 0, list: 0, remove: 0, storageMs: 0 };
  return CONTEXT.run(metrics, async () => {
    const response = await action();
    response.headers.set(
      'Server-Timing',
      Object.entries(metrics)
        .map(
          ([name, value]) =>
            `blob_${name};${name === 'storageMs' ? 'dur=' : 'desc='}${name === 'storageMs' ? Math.round(value * 100) / 100 : '"' + value + '"'}`
        )
        .join(', ')
    );
    return response;
  });
}
export function measuredStore(store) {
  if (!CONTEXT.getStore()) return store;
  return new Proxy(store, {
    get(target, property) {
      const method = target[property];
      if (typeof method !== 'function') return method;
      const operation = {
        get: 'read',
        getWithMetadata: 'read',
        set: 'write',
        setJSON: 'write',
        delete: 'remove',
        list: 'list',
      }[property];
      if (!operation) return method.bind(target);
      return (...args) => {
        const metrics = CONTEXT.getStore();
        if (metrics) metrics[operation]++;
        if (property === 'list') return method.apply(target, args);
        const start = performance.now();
        return Promise.resolve(method.apply(target, args)).finally(() => {
          if (metrics) metrics.storageMs += performance.now() - start;
        });
      };
    },
  });
}
