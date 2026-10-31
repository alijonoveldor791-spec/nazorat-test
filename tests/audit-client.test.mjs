// Lokal draft, fokusni buzmaydigan hisoblar va sekin tarmoq regressiyalari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAttempt, validResult, validReview } from '../public/js/student/draft-validate.js';
import { classProgress } from '../public/js/teacher/class-progress.js';
import { serverClock } from '../public/js/student/server-clock.js';
import { api } from '../public/js/core/api-client.js';
import { draftSync } from '../public/js/student/draft-sync.js';
const draft = {
  attemptToken: 'token',
  questions: [{ q: 'Q', options: ['A', 'B'] }],
  answers: [null],
  identity: { name: 'Ali', surname: 'Aliyev' },
};
test('R02: noto’g’ri draft rad etiladi, cursor va flag chegaralanadi', () => {
  for (const value of [null, {}, { ...draft, questions: [] }, { ...draft, answers: [10] }])
    assert.equal(normalizeAttempt(value), null);
  const valid = normalizeAttempt({ ...draft, current: -5, flags: [-1, 0, 100], serverNow: 'bad' });
  assert.equal(valid.current, 0);
  assert.deepEqual(valid.flags, [0]);
  assert.equal(valid.serverNow, undefined);
  assert.equal(validResult({ result: { total: 0 } }), false);
});
test('R02: buzilgan natija sharhi sahifani yiqitmasdan rad etiladi', () => {
  assert(!validReview({ q: 'bad' }));
  assert(!validReview([{ q: 'Q', options: 'bad', answer: 0, selected: null }]));
  assert(validReview([{ q: 'Q', options: ['A', 'B'], answer: 0, selected: null }]));
});
test('R01: saqlash joyi yo’q bo’lsa UI yolg’on saqlandi demaydi', (t) => {
  const original = globalThis.document,
    node = { textContent: '' };
  globalThis.document = { getElementById: () => node };
  t.after(() => {
    if (original === undefined) delete globalThis.document;
    else globalThis.document = original;
  });
  const sync = draftSync(
    { ...draft },
    () => {},
    () => {}
  );
  sync.changed();
  sync.stop();
  assert.match(node.textContent, /joy yetmadi/);
});
test('T02: bir test topshirilishi boshqa testdagi qarzdorlikni yopmaydi', () => {
  const cls = { id: 'c', name: '7-A', students: [{ id: 's', name: 'Ali', surname: 'Aliyev' }] };
  const progress = classProgress(
    cls,
    [{ id: 't1' }, { id: 't2' }],
    [{ classId: 'c', testId: 't1', studentId: 's' }]
  );
  assert.equal(progress[0].missing.length, 0);
  assert.equal(progress[1].missing.length, 1);
});
test('R02: taymer tizim soati o’zgarganda sakramaydi', (t) => {
  const now = serverClock('2026-01-01T00:00:00Z'),
    before = now();
  t.mock.method(Date, 'now', () => 0);
  assert(Math.abs(now() - before) < 100);
});
test('U01: javobsiz fetch cheklangan vaqtda to’xtaydi', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(new DOMException('Abort', 'AbortError')))
      )
  );
  await assert.rejects(() => api('slow', { timeoutMs: 20 }), /vaqti tugadi/);
});
test('U01: HTML 200 javob muvaffaqiyatli JSON deb qabul qilinmaydi', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>oops</html>', { status: 200 }));
  await assert.rejects(
    () => api('bad'),
    (e) => e.status === 502
  );
});
test('S05: client haqiqiy Retry-After’ni saqlaydi', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Kutish' }, { status: 429, headers: { 'Retry-After': '32' } })
  );
  await assert.rejects(
    () => api('limited'),
    (e) => e.status === 429 && e.retryAfter === 32
  );
});
