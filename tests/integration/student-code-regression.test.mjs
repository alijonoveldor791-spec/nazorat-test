// №15: haqiqiy service/repository + lokal Blobsda GET yozmasligi va tenant chegarasi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localBlobs } from '../helpers/local-blobs.mjs';
import { adminClient } from '../helpers/admin-client.mjs';
import { runWithAccess } from '../../server/lib/access-context.mjs';
import { adminClasses } from '../../server/services/student-access-service.mjs';
import { saveClass, classStudents } from '../../server/services/class-service.mjs';

test('admin list is read-only, preserves legacy data and never backfills either scope', async (t) => {
  const blobs = await localBlobs(t);
  const classes = blobs.store('classes');
  const legacy = {
    id: 'legacy-class',
    name: 'Legacy',
    students: [
      { id: 'old-person', name: 'Ali', surname: 'Aliyev', accessCode: 'ABCDEF0123456789' },
      { id: 'no-code', name: 'Vali', surname: 'Valiyev' },
    ],
  };
  await classes.setJSON(legacy.id, legacy);
  await classes.setJSON('school-class', {
    id: 'school-class',
    schoolId: 'school-a',
    name: 'School',
    students: [{ id: 'p', name: 'Ali', surname: 'Aliyev' }],
  });
  const request = await adminClient(blobs);
  const before = blobs.writes();
  const oldRows = await runWithAccess({ role: 'legacy_admin' }, adminClasses);
  const schoolRows = await runWithAccess({ role: 'school_admin', schoolId: 'school-a' }, adminClasses);
  const listed = await request('admin/classes');
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.data, schoolRows);
  assert.equal(blobs.writes(), before);
  assert.deepEqual(oldRows[0], legacy);
  assert.equal(schoolRows.length, 1);
  assert.equal('accessCode' in schoolRows[0].students[0], false);
  assert.deepEqual(await classes.get(legacy.id, { type: 'json' }), legacy);
  await runWithAccess({ role: 'school_admin', schoolId: 'school-a' }, async () => {
    const created = await saveClass({ name: '8-A', roster: 'Valiyev Vali' });
    assert.equal('accessCode' in created.students[0], false);
    await assert.rejects(saveClass({ name: 'Other' }, legacy.id), (e) => e.status === 404);
  });
  await assert.rejects(classStudents(legacy.id), (e) => e.status === 403);
});
