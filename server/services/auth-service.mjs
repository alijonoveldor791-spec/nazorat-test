// Admin autentifikatsiyasi, paroldan mustaqil sessiya va server logout.
import { randomUUID } from 'node:crypto';
import { getAuth, saveAuth, updateAuth } from '../repositories/settings-repo.mjs';
import * as sessionsRepo from '../repositories/sessions-repo.mjs';
import { updateCounter, findCounter } from '../repositories/limits-repo.mjs';
import { env, secret } from '../lib/env.mjs';
import { hash } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';
import { string } from '../lib/validate.mjs';
import { sign, verify } from '../lib/auth-token.mjs';
import { passwordHash, passwordMatches } from '../lib/password.mjs';
import { loginCounter, requireLoginAllowed } from '../lib/login-policy.mjs';
import { limit } from '../lib/rate-limit.mjs';
function bootstrapPassword() {
  const password = env('TEACHER_PASSWORD');
  if (!password || password.length < 12 || password.length > 200)
    fail('Admin kirishi bloklangan: TEACHER_PASSWORD 12–200 belgi bo’lsin.', 503);
  secret();
  return password;
}
export async function authConfig() {
  const password = bootstrapPassword(),
    old = await getAuth();
  if (old?.schema === 2) return old;
  const candidate = {
    schema: 2,
    version: randomUUID(),
    password: old?.password || (await passwordHash(password)),
  };
  return updateAuth((current) => (current?.schema === 2 ? current : candidate));
}
export async function authorize(req) {
  bootstrapPassword();
  const claim = verify(req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1], secret(), 'admin');
  if (typeof claim.jti !== 'string') fail('Sessiyani yangilash uchun qayta kiring.', 401);
  const [config, session] = await Promise.all([authConfig(), sessionsRepo.find(claim.jti)]);
  if (
    claim.version !== config.version ||
    !session ||
    session.version !== config.version ||
    session.expires <= Date.now()
  )
    fail('Sessiya bekor qilingan. Qayta kiring.', 401);
  return { ...config, sessionId: claim.jti };
}
export async function login(password, ip) {
  string(password, 'Parol', 200);
  const key = 'counters/login-' + hash(ip).slice(0, 32);
  requireLoginAllowed(await findCounter(key));
  await limit('login-requests', ip, 20, 15 * 60000);
  const config = await authConfig(),
    matches = await passwordMatches(password, config.password);
  await updateCounter(key, (previous) => loginCounter(previous, matches));
  if (!matches) fail('Parol noto’g’ri.', 401);
  if (!config.password.params) await saveAuth({ ...config, password: await passwordHash(password) });
  const jti = randomUUID(),
    exp = Date.now() + 8 * 3600000;
  await sessionsRepo.save({ id: jti, version: config.version, expires: exp });
  return { token: sign({ role: 'admin', version: config.version, jti, exp }, secret()), expiresIn: 28800 };
}
export async function logout(auth) {
  await sessionsRepo.remove(auth.sessionId);
  return { ok: true };
}
export async function changePassword(d, auth, ip) {
  await limit('password-change', ip, 10, 15 * 60000);
  if (!(await passwordMatches(d.currentPassword, auth.password))) fail('Joriy parol noto’g’ri.', 403);
  const next = string(d.newPassword, 'Yangi parol', 200);
  if (next.length < 12) fail('Yangi parol kamida 12 belgi bo’lsin.');
  await saveAuth({
    schema: 2,
    version: randomUUID(),
    password: await passwordHash(next),
  });
  return { ok: true };
}
