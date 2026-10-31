// Router va haqiqiy service/repository zanjirida rollar, egalik va sessiya regressiyalari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { randomBytes } from 'node:crypto';
import { seed, rawStore } from './memory-blobs.mjs';
register(new URL('./roles-loader.mjs', import.meta.url));
const { router } = await import('../../server/router.mjs');
const { runWithAccess, stampRow, ownsRow } = await import('../../server/lib/access-context.mjs');
process.env.TOKEN_SECRET = randomBytes(40).toString('hex');
process.env.TEACHER_PASSWORD = randomBytes(6).toString('hex');
process.env.SUPER_ADMIN_LOGIN = 'root-test';
process.env.SUPER_ADMIN_PASSWORD = randomBytes(6).toString('hex');
let root, a, b, legacy, schoolA, schoolB, classA, classB, testA, testB;
let ip = 0;
async function call(path, token, method = 'GET', body, expected = 200) {
  const response = await router(
    new Request('http://localhost/api/' + path, {
      method,
      headers: { ...(token ? { authorization: 'Bearer ' + token } : {}), 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    { ip: 'test-' + ip++ }
  );
  const value = await response.json();
  assert(
    (Array.isArray(expected) ? expected : [expected]).includes(response.status),
    `${method} ${path}: ${response.status} ${value.error || ''}`
  );
  return value;
}
const signIn = async (login, password) =>
  (await call('admin/login', null, 'POST', { login, password })).token;
test.before(async () => {
  root = await signIn('root-test', process.env.SUPER_ADMIN_PASSWORD);
  legacy = await signIn('', process.env.TEACHER_PASSWORD);
  schoolA = await call('super-admin/schools', root, 'POST', { name: 'A' }, 201);
  schoolB = await call('super-admin/schools', root, 'POST', { name: 'B' }, 201);
  for (const [school, login] of [
    [schoolA, 'admin-a'],
    [schoolB, 'admin-b'],
  ])
    await call(`super-admin/schools/${school.id}/admin`, root, 'POST', { login, password: 'Test_123' }, 201);
  a = await signIn('admin-a', 'Test_123');
  b = await signIn('admin-b', 'Test_123');
  classA = await call('admin/classes', a, 'POST', { name: '7-A' }, 201);
  classB = await call('admin/classes', b, 'POST', { name: '7-A' }, 201);
  for (const [token, cls, label] of [
    [a, classA, 'A'],
    [b, classB, 'B'],
  ]) {
    const row = await call(
      'admin/tests',
      token,
      'POST',
      {
        title: label,
        classIds: [cls.id],
        questions: [{ q: 'Q?', options: ['A', 'B'], answer: 0 }],
      },
      201
    );
    if (label === 'A') testA = row;
    else testB = row;
  }
  seed('results', 'result-a', {
    id: 'result-a',
    schoolId: schoolA.id,
    testId: testA.id,
    classId: classA.id,
    time: '2026-01-01',
    identityKey: 'a'.repeat(64),
  });
  seed('results', 'result-b', {
    id: 'result-b',
    schoolId: schoolB.id,
    testId: testB.id,
    classId: classB.id,
    time: '2026-01-01',
  });
  seed('classes', 'old-class', { id: 'old-class', name: 'Old', students: [] });
});
export {
  call,
  root,
  a,
  b,
  legacy,
  schoolA,
  schoolB,
  classA,
  classB,
  testA,
  testB,
  signIn,
  rawStore,
  runWithAccess,
  stampRow,
  ownsRow,
};
