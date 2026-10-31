// Auditdagi token, login, body va javob kaliti regressiyalari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
import { readJson } from '../server/lib/http.mjs';
import { loginCounter, requireLoginAllowed } from '../server/lib/login-policy.mjs';
import { passwordMatches } from '../server/lib/password.mjs';
import { validStudentCode, codeMatches, newStudentCode } from '../server/lib/student-code.mjs';
import { restoreResult } from '../server/lib/backup-validate.mjs';
import { requireAvailable, usableTest } from '../server/services/test-service.mjs';
import { classValid } from '../server/lib/validate.mjs';
import { authConfig } from '../server/services/auth-service.mjs';
import { scheduledAttempt, endTime, recoveryEnds } from '../server/services/attempt-access-service.mjs';

test('S04: kuchsiz boshlang’ich parol qimmat hisoblashdan oldin bloklanadi', async () => {
  const before = process.env.TEACHER_PASSWORD;
  process.env.TEACHER_PASSWORD = 'short';
  try {
    await assert.rejects(
      () => authConfig(),
      (e) => e.status === 503
    );
  } finally {
    if (before === undefined) delete process.env.TEACHER_PASSWORD;
    else process.env.TEACHER_PASSWORD = before;
  }
});
test('R01: o’qituvchi jadvalini qisqartirsa server muddati ham qisqaradi', () => {
  const current = { deadline: '2026-10-31T12:00:00Z' };
  assert.equal(
    recoveryEnds({ ...current, tokenExpires: Date.parse(current.deadline) + 14 * 86400000 }),
    Date.parse(current.deadline) + 7 * 86400000
  );
  assert.equal(
    endTime(scheduledAttempt(current, { schedule: { end: '2026-10-31T11:00:00Z' } })),
    Date.parse('2026-10-31T11:00:00Z')
  );
  assert.equal(
    endTime(scheduledAttempt(current, { schedule: { end: '2026-10-31T13:00:00Z' } })),
    Date.parse(current.deadline)
  );
});

test('S04: eski scrypt yozuvi asinxron tekshiruvga mos', async () => {
  const salt = 'old-salt',
    hash = scryptSync('legacy-password', salt, 64).toString('hex');
  assert(await passwordMatches('legacy-password', { salt, hash }));
  assert(!(await passwordMatches('wrong', { salt, hash })));
});
test('S04: 5 xato login keyingi to’g’ri parolni ham 15 daqiqa bloklaydi', () => {
  let row = null;
  const now = 1000;
  for (let i = 0; i < 5; i++) row = loginCounter(row, false, now);
  assert.throws(
    () => loginCounter(row, true, now),
    (e) => e.status === 429 && e.retryAfter === 900
  );
  assert.throws(
    () => requireLoginAllowed(row, now + 60000),
    (e) => e.retryAfter === 840
  );
  assert.equal(loginCounter(row, true, now + 900001).count, 0);
});
test('S02: o’quvchi kodlari taxmin qilinadigan ID yoki ism emas', () => {
  const a = newStudentCode(),
    b = newStudentCode();
  assert.notEqual(a, b);
  assert(validStudentCode(a));
  assert(
    codeMatches(
      a
        .toLowerCase()
        .match(/.{1,4}/g)
        .join(' '),
      a
    )
  );
  assert(!codeMatches(b, a));
  assert(!codeMatches(null, a));
});
test('S05: Content-Length va haqiqiy UTF-8 bayt chegarasi oldindan rad etiladi', async () => {
  await assert.rejects(
    () =>
      readJson(
        new Request('http://local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': '4000001' },
          body: '{}',
        })
      ),
    (e) => e.status === 413
  );
  await assert.rejects(
    () =>
      readJson(
        new Request('http://local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'ў'.repeat(2100000) }),
        })
      ),
    (e) => e.status === 413
  );
});
test('S05: buzilgan JSON va noto’g’ri tur aniq 400/415 qaytaradi', async () => {
  for (const body of ['{', 'null', '[]'])
    await assert.rejects(
      () =>
        readJson(
          new Request('http://local', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          })
        ),
      (e) => e.status === 400
    );
  await assert.rejects(
    () => readJson(new Request('http://local', { method: 'POST', body: '{}' })),
    (e) => e.status === 415
  );
});
test('R02: eski bo’sh test ochilmaydi', () => {
  assert.equal(usableTest({ questions: [] }), false);
  assert.throws(
    () => requireAvailable({ active: true, questions: [] }),
    (e) => e.status === 400
  );
});
const snapshot = {
  id: 'r',
  testId: 't',
  classId: 'c',
  name: 'Ali',
  surname: 'Aliyev',
  grade: '7-A',
  score: 1,
  total: 1,
  time: '2026-01-01T00:00:00Z',
  answers: [1],
  questions: [{ q: 'Q', options: ['a', 'b'], answer: 1, sourceIndex: 0, sourceOptions: [1, 0] }],
};
test('B01: restore ortiqcha publicResult’ni olib tashlaydi, tartibni saqlaydi', () => {
  const r = restoreResult({ ...snapshot, publicResult: { review: ['secret'] }, unexpected: 'x' });
  assert(!('publicResult' in r));
  assert(!('unexpected' in r));
  assert.deepEqual(r.questions[0].sourceOptions, [1, 0]);
});
test('B01: restore noto’g’ri ball, tartib va null yozuvni rad etadi', () => {
  assert.throws(() => restoreResult({ ...snapshot, score: 0 }));
  assert.throws(() =>
    restoreResult({ ...snapshot, questions: [{ ...snapshot.questions[0], sourceOptions: [0, 0] }] })
  );
  assert.throws(() => restoreResult(null));
});
test('B01: null o’quvchi va noto’g’ri kod 500 emas, validatsiya xatosi bo’ladi', () => {
  for (const students of [
    [null],
    [{ name: 'Ali', surname: 'Aliyev', accessCode: 'bad' }],
    [
      { name: 'Ali', surname: 'Aliyev', accessCode: 'A'.repeat(16) },
      { name: 'Vali', surname: 'Valiyev', accessCode: 'A'.repeat(16) },
    ],
  ])
    assert.throws(
      () => classValid({ name: '7-A', students }),
      (e) => e.status === 400
    );
});
