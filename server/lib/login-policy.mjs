// Login urinishlari siyosati hisoblashdan oldin ham tekshiriladi.
import { HttpError } from './http.mjs';
export function requireLoginAllowed(row, now = Date.now()) {
  if (row?.blockedUntil > now) {
    const error = new HttpError(429, "5 ta xato urinish. Birozdan keyin qayta urinib ko'ring.");
    error.retryAfter = Math.ceil((row.blockedUntil - now) / 1000);
    throw error;
  }
}
export function loginCounter(previous, matches, now = Date.now()) {
  const row = previous && previous.until > now ? previous : { count: 0, until: now + 15 * 60000 };
  requireLoginAllowed(row, now);
  if (matches) return { count: 0, until: now + 15 * 60000 };
  const count = row.count + 1;
  return {
    ...row,
    count,
    ...(count >= 5 ? { blockedUntil: now + 15 * 60000, until: now + 15 * 60000 } : {}),
  };
}
