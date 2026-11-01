// Netlify Dev emulyatorida alohida workerlar uchun lokal yozish navbati.
import { open, mkdir, stat, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const LOCK_DIRECTORY = join(tmpdir(), 'nazorat-local-locks', digest(process.cwd()));

export async function withLocalWriteLock(key, operation) {
  if (process.env.NETLIFY_DEV !== 'true') return operation();
  await mkdir(LOCK_DIRECTORY, { recursive: true });
  const path = join(LOCK_DIRECTORY, digest(key) + '.lock');
  for (let index = 0; index < 1000; index++) {
    let handle;
    try {
      handle = await open(path, 'wx');
    } catch (error) {
      // Windows o\'chirilayotgan band lock uchun EPERM/EACCES ham qaytaradi.
      if (!['EEXIST', 'EPERM', 'EACCES'].includes(error.code)) throw error;
      const current = await stat(path).catch(() => null);
      if (current && Date.now() - current.mtimeMs > 60000) await unlink(path).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 20));
      continue;
    }
    try {
      return await operation();
    } finally {
      await handle.close();
      await unlink(path).catch(() => {});
    }
  }
  const error = new Error("Lokal yozish navbati band. Qayta urinib ko'ring.");
  error.status = 409;
  throw error;
}
