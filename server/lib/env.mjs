// Muhit kalitlari interfeysi va faqat yaroqli admin imzosi uchun oldingi kalitni tekshiradi.
import { verify } from './auth-token.mjs';
import { env, adminSessionSecret } from './secret-policy.mjs';
export { env, secret, adminSessionSecret } from './secret-policy.mjs';
export function verifyAdminToken(token) {
  const current = adminSessionSecret();
  try {
    return verifyAdminWith(token, current);
  } catch (error) {
    const previous = env('ADMIN_SESSION_PREVIOUS_SECRET');
    if (error.status !== 401 || !previous || previous.trim().length < 32) throw error;
    return verifyAdminWith(token, previous);
  }
}
function verifyAdminWith(token, key) {
  return verify(token, key, 'admin');
}
