// scoring: muhim xatti-harakat regressiya sinovlari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { grade } from '../server/services/scoring-service.mjs';
import { presentation, shuffleOrder } from '../server/lib/shuffle.mjs';
import { parseAiken } from '../server/lib/aiken-parser.mjs';
import { SAMPLE as sample } from './fixtures.mjs';
test('Baholash: to’g’ri, xato va javobsiz', () =>
  assert.deepEqual(
    grade(
      parseAiken(sample),
      parseAiken(sample).map((q, i) => (i === 0 ? null : i === 1 ? 0 : q.answer))
    ).score,
    18
  ));
test('Baholash: noto’g’ri son/tur/variantlar rad etiladi', () => {
  const q = parseAiken(sample);
  for (const answers of [[], q.map(() => -1), q.map(() => 99), q.map(() => '1')])
    assert.throws(() => grade(q, answers));
});
test('Aralashtirish: deterministik permutatsiya va server bahosi', () => {
  const q = parseAiken(sample),
    settings = { shuffleQuestions: true, shuffleOptions: true };
  assert.deepEqual(shuffleOrder(20, 'seed'), shuffleOrder(20, 'seed'));
  assert.notDeepEqual(shuffleOrder(20, 'a'), shuffleOrder(20, 'b'));
  const p = presentation(q, settings, 'test');
  assert.equal(new Set(p.map((q) => q.sourceIndex)).size, 20);
  assert.equal(
    grade(
      p,
      p.map((q) => q.answer)
    ).score,
    20
  );
  p.forEach((s) => assert.equal(s.options[s.answer], q[s.sourceIndex].options[q[s.sourceIndex].answer]));
});
test('Aralashtirish o’chirilganda tartib saqlanadi', () => {
  const q = parseAiken(sample);
  const p = presentation(q, {}, 'x');
  assert.deepEqual(
    p.map((q) => q.q),
    q.map((q) => q.q)
  );
});
