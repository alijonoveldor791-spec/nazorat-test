// Alohida admin hisobi, bosh admin bootstrap va maktab admini tayinlash qoidalari.
import { randomUUID } from 'node:crypto';
import * as accounts from '../repositories/accounts-repo.mjs';
import * as schools from '../repositories/schools-repo.mjs';
import * as sessions from '../repositories/sessions-repo.mjs';
import { env, secret } from '../lib/env.mjs';
import { string } from '../lib/validate.mjs';
import { requirePassword } from '../lib/password-policy.mjs';
import { passwordHash, passwordMatches } from '../lib/password.mjs';
import { sign } from '../lib/auth-token.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
import { requireRole } from '../lib/access-context.mjs';
import { accountSchool } from './school-access-service.mjs';
export function loginName(value) {
  const login = string(value, 'Login', 60).toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,59}$/.test(login))
    fail('Login 3–60 ta lotin harfi, raqam, nuqta, defis yoki pastki chiziqdan iborat bo‘lsin.');
  return login;
}
async function bootstrap(login) {
  const configured = env('SUPER_ADMIN_LOGIN');
  if (!configured || login !== loginName(configured)) return;
  if (await accounts.find(login)) return;
  const password = await passwordHash(
    requirePassword(env('SUPER_ADMIN_PASSWORD'), 'SUPER_ADMIN_PASSWORD', 503)
  );
  await accounts.create({
    login,
    id: randomUUID(),
    role: 'super_admin',
    password,
    version: randomUUID(),
    active: true,
  });
}
export async function accountLogin(d, ip) {
  const login = loginName(d.login);
  requirePassword(d.password);
  await limit('account-login-ip', ip, 20, 15 * 60000);
  await limit('account-login-name', login, 30, 15 * 60000);
  secret();
  await bootstrap(login);
  const row = await accounts.find(login);
  if (!row?.active || !(await passwordMatches(d.password, row.password)))
    fail('Login yoki parol noto‘g‘ri.', 401);
  if (!['super_admin', 'school_admin'].includes(row.role)) fail('Bu amalga ruxsat yo‘q.', 403);
  const school = await accountSchool(row);
  const jti = randomUUID(),
    exp = Date.now() + 8 * 3600000;
  await sessions.save({
    id: jti,
    accountLogin: login,
    version: row.version,
    expires: exp,
    ...(school?.sessionVersion ? { schoolVersion: school.sessionVersion } : {}),
  });
  return {
    token: sign({ role: 'admin', accountLogin: login, jti, version: row.version, exp }, secret()),
    role: row.role,
    expiresIn: 28800,
  };
}
export async function authorizeAccount(claim, { forLogout = false } = {}) {
  const [row, session] = await Promise.all([accounts.find(claim.accountLogin), sessions.find(claim.jti)]);
  if (
    !row?.active ||
    !session ||
    session.accountLogin !== row.login ||
    session.expires <= Date.now() ||
    row.version !== claim.version ||
    session.version !== row.version
  )
    fail('Sessiya bekor qilingan. Qayta kiring.', 401);
  if (!['super_admin', 'school_admin'].includes(row.role)) fail('Bu amalga ruxsat yo‘q.', 403);
  const school = forLogout ? null : await accountSchool(row, session);
  return {
    ...row,
    sessionId: claim.jti,
    accountLogin: row.login,
    schoolName: school?.name || null,
    public_school_id: school?.public_school_id || null,
  };
}
export async function createSchoolAdmin(auth, schoolId, d) {
  requireRole(auth, ['super_admin']);
  if (d.role !== undefined || d.schoolId !== undefined)
    fail('Rol va maktab server tomonidan belgilanadi.', 403);
  const login = loginName(d.login),
    school = await schools.find(schoolId);
  if (!school) fail('Maktab topilmadi.', 404);
  if (env('SUPER_ADMIN_LOGIN') && login === loginName(env('SUPER_ADMIN_LOGIN'))) fail('Login band.', 409);
  if (school.adminLogin && school.adminLogin !== login) fail('Maktabga admin allaqachon biriktirilgan.', 409);
  const row = {
    id: randomUUID(),
    login,
    role: 'school_admin',
    schoolId,
    active: false,
    version: randomUUID(),
    password: await passwordHash(requirePassword(d.password)),
  };
  if (!(await accounts.create(row))) {
    const previous = await accounts.find(login);
    if (
      previous?.role !== 'school_admin' ||
      previous.schoolId !== schoolId ||
      !(await passwordMatches(d.password, previous.password))
    )
      fail('Login band.', 409);
    row.id = previous.id;
  }
  await schools.update(schoolId, (current) => {
    if (!current || (current.adminLogin && current.adminLogin !== login))
      fail('Maktabga admin allaqachon biriktirilgan.', 409);
    return { ...current, adminLogin: login };
  });
  await accounts.update(login, (current) => ({ ...current, active: true }));
  return { id: row.id, login, role: row.role, schoolId };
}
export async function changeAccountPassword(auth, password) {
  await accounts.update(auth.accountLogin, (current) => {
    if (current.version !== auth.version) fail('Sessiya eskirgan.', 401);
    return { ...current, password, version: randomUUID() };
  });
}
