// services/auth-service.mjs: serverdagi shu qatlam vazifasi.
import { randomUUID } from 'node:crypto';
import { getAuth, saveAuth } from '../repositories/settings-repo.mjs';
import { updateCounter } from '../repositories/limits-repo.mjs';
import { env, secret } from '../lib/env.mjs';
import { hash } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';
import { string } from '../lib/validate.mjs';
import { sign, verify } from '../lib/auth-token.mjs';
import { passwordHash, passwordMatches } from '../lib/password.mjs';
export async function authConfig() {
  const password = env('TEACHER_PASSWORD');
  if (!password) fail('Admin kirishi bloklangan: TEACHER_PASSWORD muhit o’zgaruvchisini sozlang.', 503);
  secret();
  return (
    (await getAuth()) || {
      version: hash(password),
      password: passwordHash(password, hash(password).slice(0, 32)),
    }
  );
}
export async function authorize(req) {
  const config = await authConfig();
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  const claim = verify(token, secret(), 'admin');
  if (claim.version !== config.version) fail('Parol yangilangan. Qayta kiring.', 401);
  return config;
}
export async function login(password, ip) {
  const config = await authConfig(),
    key = 'counters/login-' + hash(ip).slice(0, 32),
    matches = passwordMatches(password, config.password);
  await updateCounter(key, (previous) => {
    const now = Date.now(),
      row = previous && previous.until > now ? previous : { count: 0, until: now + 15 * 60000 };
    if (row.blockedUntil > now) fail('5 ta xato urinish. 15 daqiqadan keyin qayta urinib ko’ring.', 429);
    if (matches) return { count: 0, until: now + 15 * 60000 };
    const count = row.count + 1;
    return {
      ...row,
      count,
      ...(count >= 5 ? { blockedUntil: now + 15 * 60000, until: now + 15 * 60000 } : {}),
    };
  });
  if (!matches) fail('Parol noto’g’ri.', 401);
  return {
    token: sign({ role: 'admin', version: config.version, exp: Date.now() + 8 * 3600000 }, secret()),
    expiresIn: 28800,
  };
}
export async function changePassword(d, auth) {
  if (!passwordMatches(d.currentPassword, auth.password)) fail('Joriy parol noto’g’ri.', 403);
  const next = string(d.newPassword, 'Yangi parol', 200);
  if (next.length < 12) fail('Yangi parol kamida 12 belgi bo’lsin.');
  await saveAuth({ version: randomUUID(), password: passwordHash(next) });
  return { ok: true };
}
