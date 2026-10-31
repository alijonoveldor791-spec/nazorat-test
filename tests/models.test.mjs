// models: muhim xatti-harakat regressiya sinovlari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptTest, adaptResult, legacyClassId } from '../server/migrations/legacy.mjs';
import { status } from '../server/lib/test-status.mjs';
import { classValid, questionsValid, settingsValid, scheduleValid } from '../server/lib/validate.mjs';
test('Eski modellar: barqaror sinf ID va tafsilotsiz natija', () => {
  const t = adaptTest({ grades: ['7-A'], questions: [] }, 'old');
  assert.equal(t.classIds[0], legacyClassId('7-a'));
  assert.equal(t.settings.showAnswers, false);
  const r = adaptResult({ grade: '7-A', score: 5, total: 20 }, 'result');
  assert.equal(r.id, 'result');
  assert.deepEqual(r.answers, []);
  assert.equal(r.durationSec, null);
});
test('Jadval: faol, kelajak, tugagan va to’xtatilgan', () => {
  assert.equal(status({ active: true, schedule: { start: '2030-01-01' } }, 0), 'scheduled');
  assert.equal(status({ active: true, schedule: { end: '2000-01-01' } }), 'ended');
  assert.equal(status({ active: false }), 'paused');
  assert.equal(status({ active: true }), 'active');
});
test('Validatsiya: noto’g’ri sozlama va jadval', () => {
  assert.throws(() => settingsValid({ maxAttempts: 0 }));
  assert.throws(() => settingsValid({ showAnswers: 'yes' }));
  assert.throws(() => scheduleValid({ start: '2030-01-01', end: '2020-01-01' }));
  assert.throws(() => questionsValid([{ q: 'x', options: ['a', 'b'], answer: 3 }]));
});
test('Sinf: ro’yxat ID saqlanadi, takrorlar rad etiladi', () => {
  const old = classValid({ name: '7-A', roster: 'Aliyev Ali' });
  const updated = classValid({ name: '7-B', roster: 'Aliyev Ali\nValiyeva Malika' }, old);
  assert.equal(updated.students[0].id, old.students[0].id);
  assert.throws(() => classValid({ name: '7-A', roster: 'Aliyev Ali\nAliyev Ali' }));
});
