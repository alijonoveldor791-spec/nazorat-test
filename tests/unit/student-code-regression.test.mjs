// №15: yangi kod yaratilmasligi va mavjud legacy qiymatlarni saqlash regressiyasi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classValid } from '../../server/lib/validate.mjs';
import { codeMatches } from '../../server/lib/student-code.mjs';

test('new roster and backup students never receive generated access codes', () => {
  const roster = classValid({ name: '7-A', roster: 'Aliyev Ali' });
  const imported = classValid({ name: '7-A', students: [{ name: 'Ali', surname: 'Aliyev' }] });
  for (const row of [roster, imported]) assert.equal('accessCode' in row.students[0], false);
});

test('roster edits preserve legacy student ID and code while new students stay code-free', () => {
  const old = {
    id: 'legacy-class',
    students: [{ id: 'legacy-person', name: 'Ali', surname: 'Aliyev', accessCode: 'ABCDEF0123456789' }],
  };
  const edited = classValid({ name: '7-A', roster: 'Aliyev Ali\nValiyev Vali' }, old);
  assert.equal(edited.id, old.id);
  assert.deepEqual(edited.students[0], old.students[0]);
  assert.equal('accessCode' in edited.students[1], false);
  assert.equal(codeMatches('ABCD-EF01-2345-6789', edited.students[0].accessCode), true);
});

test('backup preserves and normalizes legacy codes, rejects invalid codes', () => {
  const student = { id: 'legacy-person', name: 'Ali', surname: 'Aliyev', accessCode: 'abcd-ef01-2345-6789' };
  const row = classValid({ name: '7-A', students: [student] });
  assert.equal(row.students[0].id, student.id);
  assert.equal(row.students[0].accessCode, 'ABCDEF0123456789');
  assert.throws(() => classValid({ name: '7-A', students: [{ ...student, accessCode: 'invalid' }] }));
});
