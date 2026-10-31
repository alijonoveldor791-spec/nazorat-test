// Haqiqiy router/service/repository zanjirida umumiy kodning saqlanishi va izolyatsiyasi.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  call,
  a,
  b,
  root,
  legacy,
  schoolA,
  classA,
  testA,
  testB,
  rawStore,
  runWithAccess,
} from './helpers/roles-fixture.mjs';
const { router } = await import('../server/router.mjs');
const { testCodeFor } = await import('../server/services/test-code-service.mjs');
let code;
test('Kod API: saqlangan test va ro‘yxatda bir xil olti raqamli kod bor', async () => {
  assert.match(testA.testCode.value, /^[0-9]{6}$/);
  code = testA.testCode;
  const detail = await call('admin/tests/' + testA.id, a);
  const list = await call('admin/tests', a);
  assert.equal(detail.testCode.value, code.value);
  assert.equal(list.find((t) => t.id === testA.id).testCode.value, code.value);
  assert.equal(code.state, 'inactive');
});
test('Kod API: registrda matn ochiq emas, faqat maktab/testga bog‘langan yozuv', () => {
  const registry = rawStore('test-codes').get(schoolA.id).value;
  assert.equal(registry.schoolId, schoolA.id);
  const record = registry.tests[testA.id];
  assert(record.encrypted && record.digest && record.id);
  assert.equal(record.value, undefined);
  assert.equal(record.studentId, undefined);
});
test('Kod API: fan va test tahriri kodni saqlaydi', async () => {
  const full = await call('admin/tests/' + testA.id, a);
  const updated = await call('admin/tests/' + testA.id, a, 'PUT', {
    ...full,
    schoolId: undefined,
    subject: 'Matematika',
    title: 'Yangilangan test',
  });
  assert.equal(updated.subject, 'Matematika');
  assert.equal(updated.testCode.value, code.value);
  assert.equal(updated.testCode.state, 'inactive');
});
test('Kod API: nusxa test yangi nofaol kod oladi', async () => {
  const copy = await call('admin/tests/' + testA.id + '/duplicate', a, 'POST', {}, 201);
  assert.notEqual(copy.id, testA.id);
  assert.notEqual(copy.testCode.value, code.value);
  assert.equal(copy.testCode.state, 'inactive');
  assert.equal(copy.active, false);
});
test('Kod API: testni to‘xtatish kodni almashtirmaydi', async () => {
  const paused = await call('admin/tests/' + testA.id + '/toggle', a, 'POST', {});
  assert.equal(paused.testCode.value, code.value);
  await call('admin/tests/' + testA.id + '/toggle', a, 'POST', {});
});
test('Kod API: boshqa maktab/bosh admin/anonim va legacy kodni boshqara olmaydi', async () => {
  for (const [token, status] of [
    [b, 404],
    [root, 403],
    [null, 401],
    [legacy, 403],
  ])
    await call(`admin/tests/${testA.id}/code`, token, 'POST', { action: 'activate', version: 1 }, status);
  await call('admin/tests/' + testB.id, a, 'GET', null, 404);
});
test('Kod API: public ro‘yxat, ID endpointi va backup kodni chiqarmaydi', async () => {
  await call('tests/' + testA.id, null, 'GET', null, 404);
  const backup = await call('admin/backup', a);
  assert(!JSON.stringify(backup).includes('testCode'));
  assert(!JSON.stringify(backup).includes('encrypted'));
});
test('Kod API: kodni bekor qilish test, urinish va natijani o‘zgartirmaydi', async () => {
  rawStore('attempts').set('started-a', {
    etag: 1,
    value: {
      schoolId: schoolA.id,
      testId: testA.id,
      deadline: '2030-01-01T12:00:00Z',
      finished: false,
      draftVersion: 3,
      answers: [0],
    },
  });
  const attemptsBefore = structuredClone([...rawStore('attempts')]);
  const before = structuredClone(rawStore('tests').get(testA.id));
  const resultsBefore = structuredClone([...rawStore('results')]);
  const active = await call(`admin/tests/${testA.id}/code`, a, 'POST', {
    action: 'activate',
    version: code.version,
  });
  const revoked = await call(`admin/tests/${testA.id}/code`, a, 'POST', {
    action: 'revoke',
    version: active.testCode.version,
  });
  code = revoked.testCode;
  assert.equal(code.state, 'revoked');
  assert.deepEqual(rawStore('tests').get(testA.id), before);
  assert.deepEqual([...rawStore('results')], resultsBefore);
  assert.deepEqual([...rawStore('attempts')], attemptsBefore);
  await call(`admin/tests/${testA.id}/code`, a, 'POST', { action: 'activate', version: code.version }, 409);
});
test('Kod API: parallel almashtirish bitta yangi kod yaratadi', async () => {
  const rows = await Promise.all(
    [1, 2].map(() =>
      call(
        `admin/tests/${testA.id}/code`,
        a,
        'POST',
        { action: 'replace', version: code.version },
        [200, 409]
      )
    )
  );
  const success = rows.filter((row) => row.testCode);
  assert.equal(success.length, 1);
  assert.notEqual(success[0].testCode.value, code.value);
  code = success[0].testCode;
  assert.equal((await call('admin/tests/' + testA.id, a)).testCode.value, code.value);
});
test('Kod API: idempotent test yaratish qaytadan kod yaratmaydi', async () => {
  const requestId = crypto.randomUUID();
  const payload = {
    requestId,
    title: 'Retry test',
    subject: 'Fan',
    classIds: [classA.id],
    questions: [{ q: 'Q?', options: ['A', 'B'], answer: 0 }],
  };
  const rows = await Promise.all([1, 2].map(() => call('admin/tests', a, 'POST', payload, 201)));
  assert.equal(rows[0].testCode.value, rows[1].testCode.value);
});
test('Kod API: oldin yaratilgan maktab testiga kod bir marta qo‘shiladi', async () => {
  const testId = crypto.randomUUID();
  rawStore('tests').set(testId, {
    etag: 1,
    value: {
      id: testId,
      schoolId: schoolA.id,
      title: 'Old tenant test',
      classIds: [classA.id],
      questions: [],
    },
  });
  const rows = await Promise.all([1, 2].map(() => call('admin/tests/' + testId, a)));
  assert.equal(rows[0].testCode.value, rows[1].testCode.value);
});
test('Kod API: administrator amallariga ham tezlik cheklovi qo‘yilgan', async () => {
  for (let index = 0; index < 61; index++) {
    const response = await router(
      new Request(`http://localhost/api/admin/tests/${testA.id}/code`, {
        method: 'POST',
        headers: { authorization: 'Bearer ' + a, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', version: -1 }),
      }),
      { ip: 'code-admin-limit' }
    );
    assert.equal(response.status, index < 60 ? 409 : 429);
    if (index === 60) assert(Number(response.headers.get('Retry-After')) > 0);
  }
});
test('Kod API: kalit o‘zgarsa kod yo‘qolmaydi yoki yangidan yaratilmaydi', async () => {
  const secret = process.env.TOKEN_SECRET;
  const before = structuredClone(rawStore('test-codes').get(schoolA.id));
  process.env.TOKEN_SECRET = 'x'.repeat(48);
  try {
    await assert.rejects(
      () =>
        runWithAccess({ role: 'school_admin', schoolId: schoolA.id }, () =>
          testCodeFor({ schoolId: schoolA.id, id: testA.id })
        ),
      (error) => error.status === 503
    );
    assert.deepEqual(rawStore('test-codes').get(schoolA.id), before);
  } finally {
    process.env.TOKEN_SECRET = secret;
  }
  assert.equal((await call('admin/tests/' + testA.id, a)).testCode.value, code.value);
});
