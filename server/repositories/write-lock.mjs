// Bitta jarayonda bir kalit yozuvlarini navbatlaydi; Blobs shartlari jarayonlar orasini himoyalaydi.
import { withLocalWriteLock } from './local-write-lock.mjs';
const WRITE_QUEUES = new Map();

export async function withKeyLock(key, operation) {
  const previous = WRITE_QUEUES.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  WRITE_QUEUES.set(key, current);
  await previous;
  try {
    return await withLocalWriteLock(key, operation);
  } finally {
    release();
    if (WRITE_QUEUES.get(key) === current) WRITE_QUEUES.delete(key);
  }
}
