// aiken-parser: muhim xatti-harakat regressiya sinovlari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAiken, toAiken } from '../server/lib/aiken-parser.mjs';
import { SAMPLE as sample } from './fixtures.mjs';
test('Aiken: namuna 20 savol va roundtrip', () => {
  const q = parseAiken(sample);
  assert.equal(q.length, 20);
  assert.equal(q[0].answer, 1);
  assert.deepEqual(parseAiken(toAiken(q)), q);
});
test('Aiken: UTF-8 BOM, CRLF, JAVOB, kichik harf va qavs', () => {
  const q = parseAiken('\ufeffSavol?\r\nA) Bir\r\nB) Ikki\r\nJAVOB： b');
  assert.equal(q[0].answer, 1);
});
for (const [name, input] of Object.entries({
  empty: '',
  missing: 'Savol\nA. Bir\nB. Ikki',
  duplicate: 'Savol\nA. Bir\nB. Ikki\nANSWER: A\nANSWER: B',
  early: 'Savol\nANSWER: A\nA. Bir\nB. Ikki',
  order: 'Savol\nB. Bir\nA. Ikki\nANSWER: A',
  outside: 'Savol\nA. Bir\nB. Ikki\nANSWER: C',
  emptyOption: 'Savol\nA.\nB. Ikki\nANSWER: A',
  many: Array(201).fill('Savol\nA. Bir\nB. Ikki\nANSWER: A').join('\n\n'),
  badAnswer: 'Savol\nA. Bir\nB. Ikki\nANSWER: G',
}))
  test('Aiken rad etadi: ' + name, () => assert.throws(() => parseAiken(input)));
test('Aiken: xatoda savol va haqiqiy qator raqami', () =>
  assert.throws(
    () => parseAiken('Savol\nA. Bir\nB. Ikki\nANSWER: A\n\nIkkinchi\nA. Bir\nB. Ikki'),
    /2-savol, 8-qator/
  ));
