// Hisob holati, sessiya almashtirish va login cheklovining server regressiyalari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { call, a, root, schoolA, rawStore } from './helpers/roles-fixture.mjs';
const { router } = await import('../server/router.mjs');
import { sign } from '../server/lib/auth-token.mjs';
test('Hisob kirishi: noma’lum login uchun IP rate limit 429 va Retry-After beradi', async () => {
  for (let index = 0; index < 21; index++) {
    const response = await router(
      new Request('http://localhost/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: 'missing-login', password: 'Wrong_123' }),
      }),
      { ip: 'brute-force-ip' }
    );
    assert.equal(response.status, index < 20 ? 401 : 429);
    if (index === 20) assert(Number(response.headers.get('Retry-After')) > 0);
  }
});
test('Sessiya: haqiqiy imzoli token ham boshqa login sessiyasini egallay olmaydi', async () => {
  const original = JSON.parse(Buffer.from(root.split('.')[0], 'base64url').toString());
  const forged = sign({ ...original, accountLogin: 'admin-a' }, process.env.TOKEN_SECRET);
  await call('admin/session', forged, 'GET', null, 401);
});
test('Hisob yaratish: rolni mijoz tanlamaydi; bosh admin loginini egallab bo‘lmaydi', async () => {
  await call(
    `super-admin/schools/${schoolA.id}/admin`,
    root,
    'POST',
    {
      login: 'escalate',
      password: 'Wrong_123',
      role: 'super_admin',
    },
    403
  );
  await call(
    `super-admin/schools/${schoolA.id}/admin`,
    root,
    'POST',
    {
      login: process.env.SUPER_ADMIN_LOGIN,
      password: 'Wrong_123',
    },
    409
  );
});
test('Maktab metama’lumoti: ID o‘zgarmaydi, noto‘g‘ri obuna holati rad', async () => {
  const renamed = await call('super-admin/schools/' + schoolA.id, root, 'PUT', { name: 'Renamed A' });
  assert.equal(renamed.id, schoolA.id);
  await call('super-admin/schools/' + schoolA.id, root, 'PUT', { id: 'changed', name: 'X' }, 400);
  await call(
    'super-admin/schools/' + schoolA.id + '/subscription',
    root,
    'PUT',
    { status: 'x', endsAt: '2030-01-01' },
    400
  );
});
test('Sessiya: hisob inactive bo‘lganda allaqachon berilgan token ham rad', async () => {
  const account = rawStore('admin-accounts').get('admin-a');
  account.value.active = false;
  await call('admin/session', a, 'GET', null, 401);
  account.value.active = true;
});
test('Egalik: hisob va maktab admin sloti mos kelmasa sessiya rad', async () => {
  const school = rawStore('schools').get(schoolA.id);
  school.value.adminLogin = 'other-admin';
  await call('admin/classes', a, 'GET', null, 403);
  school.value.adminLogin = 'admin-a';
});
