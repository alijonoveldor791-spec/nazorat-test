// Production'da doimiy Netlify Blobs, lokal serverda alohida vaqtinchalik ombor tanlaydi.
import { getStore as getPersistentStore } from '@netlify/blobs';
import { getStore as getMemoryStore } from './memory-blob-store.mjs';
import { openLocalBlobStore } from './local-blob-store.mjs';

let localStore;
export async function initializeLocalStorage(directory) {
  if (!directory || process.env.NETLIFY === 'true' || process.env.NODE_ENV === 'production') return;
  localStore = await openLocalBlobStore(directory);
}

export function getStore(options) {
  const localOnly =
    process.env.NAZORAT_LOCAL_MEMORY === 'true' &&
    process.env.NETLIFY !== 'true' &&
    process.env.NODE_ENV !== 'production';
  if (localOnly) return localStore ? localStore.getStore(options) : getMemoryStore(options);
  return getPersistentStore(options);
}
