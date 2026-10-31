// verify: lokal tekshiruv uchun yordamchi.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { admin, request, fixture, cleanup, artifact } from './helpers.mjs';
const token = await admin(),
  logs = [];
const pass = (message) => {
  logs.push(message);
  console.log('PASS:', message);
};
let cls, test;
try {
  ({ cls, test } = await fixture(
    token,
    { shuffleQuestions: true, shuffleOptions: true, maxAttempts: 1 },
    'Aliyev Ali\nValiyeva Malika'
  ));
  pass('Sinf yaratildi, 20 savollik test saqlandi.');
  const preview = await request('admin/tests/preview', {
    token,
    method: 'POST',
    body: { text: readFileSync('samples/namuna-test.txt', 'utf8') },
  });
  assert.equal(preview.questions.length, 20);
  await request(`classes/${cls.id}/students`, { expected: 403 });
  const roster = cls.students;
  assert.equal(roster.length, 2);
  const list = await request('tests?classId=' + cls.id);
  assert(list.some((t) => t.id === test.id));
  const who = { classId: cls.id, studentCode: cls.students[0].accessCode };
  const parallelStarts = await Promise.all(
    Array.from({ length: 3 }, () =>
      request(`tests/${test.id}/start`, { method: 'POST', body: who, expected: [200, 201] })
    )
  );
  const attempt = parallelStarts[0];
  assert(parallelStarts.every((item) => item.attemptToken === attempt.attemptToken));
  assert(
    attempt.questions.every((q) => !('answer' in q) && !('sourceIndex' in q) && !('sourceOptions' in q))
  );
  const again = await request(`tests/${test.id}/start`, { method: 'POST', body: who });
  assert.equal(again.attemptToken, attempt.attemptToken);
  pass('Ro’yxatdan tanlash va serverdagi urinishni tiklash; javob kaliti oshkor qilinmadi.');
  const full = await request('admin/tests/' + test.id, { token });
  const answers = attempt.questions.map((q) => {
    const original = full.questions.find((x) => x.q === q.q);
    return q.options.indexOf(original.options[original.answer]);
  });
  await request('submit', {
    method: 'POST',
    body: { attemptToken: attempt.attemptToken, answers: [] },
    expected: 400,
  });
  const parallelSubmits = await Promise.all(
    Array.from({ length: 3 }, () =>
      request('submit', {
        method: 'POST',
        body: { attemptToken: attempt.attemptToken, answers },
      })
    )
  );
  const result = parallelSubmits[0];
  assert(parallelSubmits.every((item) => item.score === 20));
  assert.equal(result.score, 20);
  assert(!result.review);
  assert(!JSON.stringify(result).includes('answer'));
  const retry = await request('submit', {
    method: 'POST',
    body: { attemptToken: attempt.attemptToken, answers },
  });
  assert.deepEqual(retry, result);
  const results = await request('admin/results', { token }),
    row = results.find((r) => r.testId === test.id);
  assert(row);
  assert.equal(results.filter((r) => r.testId === test.id).length, 1);
  pass('Aralashtirilgan test 20/20; takror yuborish bitta natija yaratdi.');
  const detail = await request('admin/results/' + row.id, { token });
  assert.equal(detail.answers.length, 20);
  assert.equal(detail.questions.length, 20);
  const analytics = await request('admin/analysis?testId=' + test.id, { token });
  assert(analytics.questions.every((q) => q.percent === 100));
  pass('Panel natijasi, tafsilot va savollar tahlili to’g’ri.');
  await request(`tests/${test.id}/start`, { method: 'POST', body: who, expected: 403 });
  await request('admin/results/' + row.id + '/retake', { token, method: 'POST', body: {} });
  await request(`tests/${test.id}/start`, { method: 'POST', body: who, expected: 201 });
  pass('Bir martalik limit va o’qituvchi qayta ruxsati ishladi.');
  const backup = await request('admin/backup', { token });
  assert(backup.tests.some((t) => t.id === test.id));
  assert(!JSON.stringify(backup).includes('TOKEN_SECRET'));
  await request('admin/restore', {
    token,
    method: 'POST',
    body: {
      version: 2,
      classes: backup.classes.filter((c) => c.id === cls.id),
      tests: backup.tests.filter((t) => t.id === test.id),
      results: backup.results.filter((r) => r.testId === test.id),
    },
  });
  pass('Zaxira va validatsiyali tiklash ishladi.');
  await request('admin/tests', { expected: 401 });
  await request('admin/preview', { token, method: 'POST', body: { text: 'x' }, expected: 400 });
  await request(`tests/${test.id}/start`, {
    method: 'POST',
    body: { classId: 'wrong', name: 'Ali', surname: 'Aliyev' },
    expected: 403,
  });
  pass('Tokensiz kirish, xato Aiken va boshqa sinf rad etildi.');
  await request('admin/tests/' + test.id, {
    token,
    method: 'PUT',
    body: { ...full, settings: { ...full.settings, showAnswers: true } },
  });
  const second = await request(`tests/${test.id}/start`, {
    method: 'POST',
    body: { classId: cls.id, studentCode: cls.students[1].accessCode },
    expected: 201,
  });
  const revealed = await request('submit', {
    method: 'POST',
    body: { attemptToken: second.attemptToken, answers: second.questions.map(() => null) },
  });
  assert.equal(revealed.review.length, 20);
  pass('To’g’ri javoblar faqat yakunlangach va ruxsat yoqilganda qaytdi.');
  await request('admin/tests/' + test.id + '/toggle', { token, method: 'POST', body: {} });
  await request(`tests/${test.id}/start`, { method: 'POST', body: who, expected: 403 });
  pass('To’xtatilgan test ochilmadi.');
  artifact('integration.json', { time: new Date().toISOString(), passed: logs.length, logs });
} finally {
  await cleanup(token, cls, test);
}
