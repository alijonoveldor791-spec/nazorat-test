// Loginli admin hisobining sessiyasi, logout va parol almashtirishini boshqaradi.
import * as sessionsRepo from '../repositories/sessions-repo.mjs';
import { verifyAdminToken } from '../lib/env.mjs';
import { fail } from '../lib/http.mjs';
import { passwordHash, passwordMatches } from '../lib/password.mjs';
import { limit } from '../lib/rate-limit.mjs';
import { requirePassword } from '../lib/password-policy.mjs';
import { authorizeAccount, changeAccountPassword } from './account-service.mjs';
export async function authorize(req) {
  const claim = verifyAdminToken(req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]);
  if (typeof claim.jti !== 'string' || typeof claim.accountLogin !== 'string')
    fail('Login va parol bilan qayta kiring.', 401);
  return authorizeAccount(claim, {
    forLogout: new URL(req.url).pathname.replace(/\/+$/, '').endsWith('/admin/logout'),
  });
}
export async function logout(auth) {
  await sessionsRepo.remove(auth.sessionId);
  return { ok: true };
}
export async function changePassword(d, auth, ip) {
  await limit('password-change', ip, 10, 15 * 60000);
  if (!(await passwordMatches(d.currentPassword, auth.password))) fail("Joriy parol noto'g'ri.", 403);
  const next = requirePassword(d.newPassword, 'Yangi parol');
  await changeAccountPassword(auth, await passwordHash(next));
  return { ok: true };
}
