// lib/env.mjs: serverdagi shu qatlam vazifasi.
import { fail } from './http.mjs';
import { verify } from './auth-token.mjs';
export const env = (name) => globalThis.Netlify?.env?.get(name) || process.env[name];
export function secret() {
  const key = env('TOKEN_SECRET');
  if (!key || key.length < 32) fail('Serverda TOKEN_SECRET sozlanmagan (kamida 32 belgi).', 503);
  return key;
}
export function adminSessionSecret() {
  const key = env('ADMIN_SESSION_SECRET') || secret();
  if (key.length < 32) fail('ADMIN_SESSION_SECRET kamida 32 belgi bo\'lsin.', 503);
  return key;
}
export function verifyAdminToken(token) {
  try { return verifyAdminWith(token, adminSessionSecret()); } catch (error) {
    const previous = env('ADMIN_SESSION_PREVIOUS_SECRET');
    if (!previous || previous.length < 32) throw error;
    return verifyAdminWith(token, previous);
  }
}
function verifyAdminWith(token, key) {
  return verify(token, key, 'admin');
}
