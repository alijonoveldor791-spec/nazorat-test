// Audit topilmalarini haqiqiy Netlify Dev API orqali regressiya tekshiradi.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { admin, request, fixture, cleanup, artifact, base } from './helpers.mjs';
import { hash, norm } from '../server/lib/identity.mjs';
import { sign } from '../server/lib/auth-token.mjs';
const KEY = randomUUID(),
  token = await admin(),
  fixtures = [],
  logs = [];
const pass = (message) => {
  logs.push(message);
  console.log('PASS:', message);
};
const start = (test, who, expected = 201) =>
  request(`tests/${test.id}/start`, { method: 'POST', body: { ...who, browserKey: KEY }, expected });
const submit = (attempt, answers, extra = {}) =>
  request('submit', {
    method: 'POST',
    body: { attemptToken: attempt.attemptToken, browserKey: KEY, answers, ...extra },
  });
async function make(settings = {}, roster = 'Aliyev Ali\nValiyeva Malika') {
  const f = await fixture(token, settings, roster);
  fixtures.push(f);
  return f;
}
function answers(attempt, full) {
  return attempt.questions.map((q) => {
    const source = full.questions.find((item) => item.q === q.q);
    return q.options.indexOf(source.options[source.answer]);
  });
}
try {
  const claim = JSON.parse(Buffer.from(token.split('.')[0], 'base64url'));
  assert.notEqual(claim.version, hash(process.env.TEACHER_PASSWORD));
  assert.match(claim.version, /^[a-f0-9-]{36}$/i);
  assert(claim.jti);
  const second = await admin();
  await request('admin/logout', { token: second, method: 'POST' });
  await request('admin/tests', { token: second, expected: 401 });
  const old = sign(
    { role: 'admin', version: hash(process.env.TEACHER_PASSWORD), exp: Date.now() + 60000 },
    process.env.TOKEN_SECRET
  );
  await request('admin/tests', { token: old, expected: 401 });
  pass('S01/S04: parol fingerprinti yo’q, eski token va server logout rad etildi.');

  const { cls, test } = await make({
    showAnswers: true,
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
  });
  const publicClasses = await request('classes');
  assert(!JSON.stringify(publicClasses).includes(cls.students[0].accessCode));
  await request(`classes/${cls.id}/students`, { expected: 403 });
  await start(test, { classId: cls.id, studentId: cls.students[0].id }, 403);
  await start(test, { classId: cls.id, studentCode: '0'.repeat(16) }, 403);
  const who = { classId: cls.id, studentCode: cls.students[0].accessCode };
  const attempt = await start(test, who),
    full = await request('admin/tests/' + test.id, { token });
  assert(attempt.questions.every((q) => !('answer' in q)));
  assert(!JSON.stringify(attempt).includes(cls.students[0].accessCode));
  await request(`tests/${test.id}/start`, {
    method: 'POST',
    body: { ...who, browserKey: randomUUID() },
    expected: 409,
  });
  await request('submit', {
    method: 'POST',
    body: {
      attemptToken: attempt.attemptToken,
      browserKey: randomUUID(),
      answers: attempt.questions.map(() => null),
    },
    expected: 403,
  });
  pass('S02: roster yopiq, ID yoki noto’g’ri kod token bermaydi; boshqa brauzer urinishni egallay olmaydi.');
  const correct = answers(attempt, full);
  const visible = await submit(attempt, correct);
  assert.equal(visible.review.length, 20);
  await request('admin/tests/' + test.id, {
    token,
    method: 'PUT',
    body: { ...full, settings: { ...full.settings, showAnswers: false } },
  });
  const hidden = await submit(attempt, correct);
  assert(!hidden.review);
  assert(!JSON.stringify(hidden).includes('answer'));
  const resumed = await request('attempts/resume', {
    method: 'POST',
    body: { attemptToken: attempt.attemptToken, browserKey: KEY },
  });
  assert(!resumed.result.review);
  const expired = sign(
    { role: 'attempt', id: attempt.attemptId, exp: Date.now() - 1000 },
    process.env.TOKEN_SECRET
  );
  assert.equal((await submit({ ...attempt, attemptToken: expired }, correct)).score, 20);
  pass(
    'S03/R01: showAnswers o’chirilgach replay kalit bermadi; eski natija muddati o’tgan imzo bilan xavfsiz tiklandi.'
  );

  const backup = await request('admin/backup', { token }),
    original = backup.results.find((r) => r.testId === test.id);
  const student = cls.students[1],
    resultId = randomUUID();
  const restored = {
    ...original,
    id: resultId,
    attemptId: hash('restored') + '/' + resultId,
    name: student.name,
    surname: student.surname,
    studentId: student.id,
    identityKey: hash(test.id + '|' + cls.id + '|' + norm(student.surname + ' ' + student.name)),
    publicResult: { review: ['injected'] },
  };
  await request('admin/restore', {
    token,
    method: 'POST',
    body: {
      version: 2,
      classes: [backup.classes.find((c) => c.id === cls.id)],
      tests: [backup.tests.find((t) => t.id === test.id)],
      results: [restored],
    },
  });
  const restoredDetail = await request('admin/results/' + resultId, { token });
  assert(!restoredDetail.publicResult);
  assert(restoredDetail.questions.every((q) => q.sourceOptions?.length));
  await start(test, { classId: cls.id, studentCode: student.accessCode }, 403);
  await request('admin/results/' + resultId + '/retake', { token, method: 'POST', body: {} });
  await start(test, { classId: cls.id, studentCode: student.accessCode });
  pass('B01: restore allowlist/tartib va yangi muhitdagi topshirish limiti saqlandi.');

  const timed = await make();
  const timedFull = await request('admin/tests/' + timed.test.id, { token });
  const end = new Date(Date.now() + 3000).toISOString();
  await request('admin/tests/' + timed.test.id, {
    token,
    method: 'PUT',
    body: { ...timedFull, schedule: { start: null, end } },
  });
  const timedAttempt = await start(timed.test, {
    classId: timed.cls.id,
    studentCode: timed.cls.students[0].accessCode,
  });
  const timedAnswers = answers(timedAttempt, timedFull);
  await request('attempts/draft', {
    method: 'POST',
    body: { attemptToken: timedAttempt.attemptToken, browserKey: KEY, answers: timedAnswers, version: 2 },
  });
  await request('attempts/draft', {
    method: 'POST',
    body: {
      attemptToken: timedAttempt.attemptToken,
      browserKey: KEY,
      answers: timedAnswers.map(() => null),
      version: 1,
    },
  });
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, Date.parse(end) - Date.now() + 80)));
  const rows = await request('admin/results', { token }),
    timedRow = rows.find((r) => r.testId === timed.test.id);
  assert(timedRow);
  assert.equal(timedRow.score, 20);
  assert.equal(timedRow.timedOut, true);
  const late = await submit(
    timedAttempt,
    timedAnswers.map(() => null)
  );
  assert.equal(late.score, 20);
  pass(
    'R01: eski draft yangi javobni bosmadi; muddatda server nusxasi 20/20 yakunlandi, kech javob o’zgartirmadi.'
  );

  const parallel = await make({ maxAttempts: 1 }, '');
  const starts = await Promise.all(
    Array.from({ length: 4 }, () =>
      start(parallel.test, { classId: parallel.cls.id, name: 'Parallel', surname: 'Sinov' }, [200, 201])
    )
  );
  assert(starts.every((a) => a.attemptToken === starts[0].attemptToken));
  const pf = await request('admin/tests/' + parallel.test.id, { token }),
    pa = answers(starts[0], pf);
  const both = await Promise.all([
    submit(starts[0], pa),
    submit(
      starts[0],
      pa.map(() => null)
    ),
  ]);
  assert.deepEqual(both[0], both[1]);
  assert.equal(
    (await request('admin/results', { token })).filter((r) => r.testId === parallel.test.id).length,
    1
  );
  pass('R03: 4 parallel start va turli javobli 2 submit faqat bitta urinish/natija yaratdi.');
  let limited;
  for (let i = 0; i < 22; i++) {
    const r = await fetch(base + '/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptToken: starts[0].attemptToken, browserKey: KEY, answers: pa }),
    });
    if (r.status === 429) {
      limited = r;
      break;
    }
    assert.equal(r.status, 200);
  }
  assert(limited);
  const retry = Number(limited.headers.get('retry-after'));
  assert(retry > 0 && retry <= 60);
  pass('S05: urinish limiti ishladi va Retry-After 60 soniyadan oshmadi.');
  artifact('audit-api.json', { passed: logs.length, logs });
} finally {
  for (const f of fixtures) await cleanup(token, f.cls, f.test);
}
