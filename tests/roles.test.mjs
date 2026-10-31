// Server rollari va maktablararo egalikning integratsiya regressiyalari.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
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
} from './helpers/roles-fixture.mjs';
test('RBAC: server rolni belgilaydi, legacy bosh admin bo‘lmaydi', async () => {
  assert.equal((await call('admin/session', root)).role, 'super_admin');
  assert.equal((await call('admin/session', a)).schoolId, schoolA.id);
  assert.equal((await call('admin/session', legacy)).role, 'legacy_admin');
  await call('super-admin/schools', legacy, 'GET', null, 403);
});
test('RBAC: anonim/o‘quvchi admin APIga kirmaydi', async () => {
  for (const path of ['admin/classes', 'admin/tests', 'admin/results', 'super-admin/schools'])
    await call(path, null, 'GET', null, 401);
});
test('RBAC: bosh admin o‘quvchi natijalari/kalitlarini olmaydi', async () => {
  for (const path of ['admin/tests', 'admin/results', 'admin/backup', 'admin/classes'])
    await call(path, root, 'GET', null, 403);
});
test('RBAC: maktab admini maktab/obuna/admin yarata olmaydi', async () => {
  await call('super-admin/schools', a, 'POST', { name: 'Forbidden' }, 403);
  await call(
    `super-admin/schools/${schoolB.id}/subscription`,
    a,
    'PUT',
    { status: 'active', endsAt: '2030-01-01' },
    403
  );
  await call(
    `super-admin/schools/${schoolA.id}/admin`,
    a,
    'POST',
    { login: 'evil', password: 'Test_123' },
    403
  );
});
test('Egalik: ro‘yxatlar va parallel kontekstlar aralashmaydi', async () => {
  const [rowsA, rowsB] = await Promise.all([call('admin/classes', a), call('admin/classes', b)]);
  assert.deepEqual(
    rowsA.map((row) => row.id),
    [classA.id]
  );
  assert.deepEqual(
    rowsB.map((row) => row.id),
    [classB.id]
  );
  assert.deepEqual(
    (await call('admin/tests', a)).map((row) => row.id),
    [testA.id]
  );
  assert.deepEqual(
    (await call('admin/results', a)).map((row) => row.id),
    ['result-a']
  );
});
test('Egalik: begona ID bilan o‘qish, nusxa, tahrir va o‘chirish rad', async () => {
  await call('admin/tests/' + testB.id, a, 'GET', null, 404);
  await call('admin/tests/' + testB.id + '/duplicate', a, 'POST', {}, 404);
  await call('admin/tests/' + testB.id + '/toggle', a, 'POST', {}, 404);
  await call('admin/tests/' + testB.id, a, 'PUT', { title: 'X' }, 404);
  await call('admin/tests/' + testB.id, a, 'DELETE', null, 404);
  await call('admin/classes/' + classB.id, a, 'DELETE', null, 404);
  await call('admin/results/result-b', a, 'DELETE', null, 404);
  assert.equal((await call('admin/tests/' + testB.id, b)).title, 'B');
});
test('Egalik: body/query schoolId rolni oshirmaydi', async () => {
  await call('admin/classes', a, 'POST', { name: 'X', schoolId: schoolB.id }, 403);
  await call('admin/classes', a, 'POST', { name: 'X', role: 'super_admin' }, 403);
  assert.deepEqual(
    (await call('admin/classes?schoolId=' + schoolB.id, a)).map((r) => r.id),
    [classA.id]
  );
});
test('Egalik: boshqa maktab sinfiga test bog‘lanmaydi', async () => {
  await call('admin/tests', a, 'POST', { title: 'X', classIds: [classB.id] }, 400);
});
test('Egalik: eksport, tahlil, retake va backup faqat o‘z maktabi', async () => {
  await call('admin/tests/' + testB.id + '/export', a, 'GET', null, 404);
  await call('admin/analysis?testId=' + testB.id, a, 'GET', null, 404);
  await call('admin/results/result-b/retake', a, 'POST', {}, 404);
  const backup = await call('admin/backup', a);
  assert.deepEqual(
    backup.tests.map((r) => r.id),
    [testA.id]
  );
  assert.deepEqual(
    backup.results.map((r) => r.id),
    ['result-a']
  );
});
test('Egalik: restore/clear yangi adminlarga berilmagan', async () => {
  await call('admin/restore', a, 'POST', {}, 403);
  await call('admin/clear', a, 'POST', { confirmation: 'HAMMASINI OCHIRISH' }, 403);
});
test('Moslik: legacy faqat egasiz yozuvlarni oladi, yangi maktab eski yozuvni egallamaydi', async () => {
  assert((await call('admin/classes', legacy)).some((r) => r.id === 'old-class'));
  await call('admin/classes/old-class', a, 'PUT', { name: 'Steal' }, 404);
  assert.equal(rawStore('classes').get('old-class').value.schoolId, undefined);
});
test('Public: yangi maktab ma’lumoti eski ochiq API orqali chiqmaydi', async () => {
  assert(!(await call('classes')).some((r) => r.id === classA.id));
  await call('tests/' + testA.id, null, 'GET', null, 404);
  await call('classes/' + classA.id + '/students', null, 'GET', null, 403);
});
test('Hisob: har maktabda bitta admin va login noyob', async () => {
  await call(
    `super-admin/schools/${schoolA.id}/admin`,
    root,
    'POST',
    { login: 'another-a', password: 'Test_123' },
    409
  );
  await call(
    `super-admin/schools/${schoolB.id}/admin`,
    root,
    'POST',
    { login: 'admin-a', password: 'Test_123' },
    409
  );
});
test('Hisob: takror tayinlash idempotent, parallel boshqa loginlar rad', async () => {
  const repeated = await call(
    `super-admin/schools/${schoolA.id}/admin`,
    root,
    'POST',
    { login: 'admin-a', password: 'Test_123' },
    201
  );
  assert.equal(repeated.schoolId, schoolA.id);
  const school = await call('super-admin/schools', root, 'POST', { name: 'Concurrent' }, 201);
  const attempts = await Promise.all(
    ['race-one', 'race-two'].map((login) =>
      call(
        `super-admin/schools/${school.id}/admin`,
        root,
        'POST',
        { login, password: 'Test_123' },
        [201, 409]
      )
    )
  );
  assert.equal(attempts.filter((row) => row.schoolId === school.id).length, 1);
});
test('Egalik: requestId to‘qnashuvi begona testni ochmaydi yoki yangilamaydi', async () => {
  await call(
    'admin/tests',
    a,
    'POST',
    {
      requestId: testB.id,
      title: 'Collision',
      classIds: [classA.id],
      questions: [{ q: 'Q', options: ['a', 'b'], answer: 0 }],
    },
    404
  );
  assert.equal((await call('admin/tests/' + testB.id, b)).title, 'B');
});
test('Hisob: parol va hash API javoblarida yo‘q; obuna faqat metadata', async () => {
  const rows = await call('super-admin/schools', root);
  assert(!JSON.stringify(rows).includes('password'));
  const result = await call(`super-admin/schools/${schoolA.id}/subscription`, root, 'PUT', {
    status: 'active',
    endsAt: '2030-01-01',
  });
  assert.equal(result.subscription.status, 'active');
});
test('Sessiya: yangi hisob paroli o‘zgarsa eski token rad', async () => {
  await call('admin/password', b, 'POST', { currentPassword: 'Test_123', newPassword: 'Next_123' });
  await call('admin/session', b, 'GET', null, 401);
  const next = await signIn('admin-b', 'Next_123');
  await call('admin/logout', next, 'POST');
  await call('admin/session', next, 'GET', null, 401);
});
test('Sessiya: logout bosh admin sessiyasini serverda bekor qiladi', async () => {
  await call('admin/logout', root, 'POST');
  await call('super-admin/schools', root, 'GET', null, 401);
});
test('Scope: asinxron kontekst va egalikni shtamplash yopiq', async () => {
  await runWithAccess({ role: 'school_admin', schoolId: 'a' }, async () => {
    await Promise.resolve();
    assert.equal(stampRow({ id: 'x' }).schoolId, 'a');
    assert.throws(() => stampRow({ id: 'x', schoolId: 'b' }));
    assert(!ownsRow({ schoolId: 'b' }));
  });
});
