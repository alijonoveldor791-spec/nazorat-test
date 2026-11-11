// lib/rate-limit.mjs: serverdagi shu qatlam vazifasi.
import { updateCounter, findCounter } from '../repositories/limits-repo.mjs';
import { HttpError } from './http.mjs';
import { hash } from './identity.mjs';
export function ipAddress(req, context) {
  return context?.ip || req.headers.get('x-nf-client-connection-ip') || 'local';
}
export async function limit(scope, ip, max = 60, windowMs = 60000) {
  const key = 'counters/' + scope + '-' + hash(ip).slice(0, 32);
  await updateCounter(key, (previous) => {
    const now = Date.now(),
      row = previous && previous.until > now ? previous : { count: 0, until: now + windowMs };
    if (row.count >= max) {
      const error = new HttpError(429, "So'rovlar ko'paydi. Birozdan keyin qayta urinib ko'ring.");
      error.retryAfter = Math.max(1, Math.ceil((row.until - now) / 1000));
      throw error;
    }
    return { ...row, count: row.count + 1 };
  });
}

export async function checkLimit(scope, ip, max) {
  const row = await findCounter('counters/' + scope + '-' + hash(ip).slice(0, 32));
  if (row && row.until > Date.now() && row.count >= max) {
    const error = new HttpError(429, "Noto'g'ri kirishlar ko'paydi. Birozdan keyin qayta urinib ko'ring.");
    error.retryAfter = Math.max(1, Math.ceil((row.until - Date.now()) / 1000));
    throw error;
  }
}
