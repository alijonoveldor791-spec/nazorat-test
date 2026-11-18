// Production'da doimiy Netlify Blobs, lokal serverda alohida vaqtinchalik ombor tanlaydi.
import { getStore as getPersistentStore } from '@netlify/blobs';
import { getStore as getMemoryStore } from './memory-blob-store.mjs';

export function getStore(options) {
  const localOnly =
    process.env.NAZORAT_LOCAL_MEMORY === 'true' &&
    process.env.NETLIFY !== 'true' &&
    process.env.NODE_ENV !== 'production';
  return localOnly ? getMemoryStore(options) : getPersistentStore(options);
}
