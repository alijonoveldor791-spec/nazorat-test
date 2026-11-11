// Yuklamadan alohida ravishda draft, muddat, egalik va tiklash yaxlitligini tekshiradi.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { loadTarget, client } from './target.mjs';
const fixture = JSON.parse(await readFile(process.env.LOAD_FIXTURE || '.local/load/fixture.json', 'utf8'));
loadTarget(fixture.baseUrl);
const school = fixture.schools[0],
  admin = client(fixture.baseUrl, school.token),
  run = Date.now().toString(36);
async function status(path, body, expected, token) {
  const r = await fetch(fixture.baseUrl + '/api/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const v = await r.json();
  assert.equal(r.status, expected, JSON.stringify(v));
  return v;
}
const source = await admin('admin/tests/' + school.tests.block.id);
const test = await admin('admin/tests', {
  title: 'LOAD protocol ' + run,
  testType: 'block',
  direction: 'Aniq fanlar',
  classIds: school.classIds,
  questions: source.questions,
  settings: { maxAttempts: 1 },
  schedule: { end: new Date(Date.now() + 60000).toISOString() },
});
await admin('admin/tests/' + test.id + '/code', { action: 'activate', version: test.testCode.version });
const entry = {
  public_school_id: school.publicId,
  testCode: test.testCode.value,
  browserKey: randomUUID(),
  classId: school.classIds[0],
  name: 'Protocol',
  surname: run,
};
const attempt = await status('school-entry/start', entry, 201);
assert(attempt.questions.every((q) => q.answer === undefined));
const auth = { attemptToken: attempt.attemptToken, browserKey: entry.browserKey },
  answers = source.questions.map((q) => q.answer);
await status('attempts/draft', { ...auth, answers, version: 3 }, 200);
await status('attempts/draft', { ...auth, answers: Array(90).fill(null), version: 1 }, 200);
const resumed = await status('attempts/resume', auth, 200);
assert.equal(resumed.draftVersion, 3);
assert.deepEqual(resumed.answers, answers);
await status('attempts/resume', { ...auth, browserKey: randomUUID() }, 403);
await new Promise((done) => setTimeout(done, Math.max(0, Date.parse(attempt.deadline) - Date.now() + 100)));
const result = await status('submit', { ...auth, answers: Array(90).fill(null) }, 200);
assert.equal(result.score, 90);
assert.equal(result.timedOut, true);
assert(!result.review);
assert.deepEqual(await status('submit', { ...auth, answers: Array(90).fill(0) }, 200), result);
const rows = (await admin('admin/results')).filter((r) => r.surname === run);
assert.equal(rows.length, 1);
assert(!rows[0].questions);
assert(!rows[0].answers);
const backup = await admin('admin/backup');
const preview = await admin('admin/restore-preview', backup);
const restored = await admin('admin/restore', { previewId: preview.previewId, fileHash: preview.fileHash });
assert.equal(restored.ok, true);
const detail = await admin('admin/results/' + rows[0].id);
assert.deepEqual(detail.answers, answers);
assert.equal(detail.score, 90);
if (fixture.schools.length > 1) {
  const other = fixture.schools[1];
  await status('admin/tests/' + test.id, null, 404, other.token);
  await status('admin/results/' + rows[0].id, null, 404, other.token);
  await status('admin/restore-preview', backup, 403, other.token);
  const theirs = await client(fixture.baseUrl, other.token)('admin/results');
  assert(!theirs.some((r) => r.id === rows[0].id));
}
const report = {
  environment: fixture.environment,
  run,
  checks: [
    'stale draft',
    'browser ownership',
    'deadline uses stored draft',
    'idempotent submit',
    'one result',
    'public answers hidden',
    'summary allowlist',
    'backup restore',
    'school isolation',
  ],
  passed: true,
};
await writeFile('.local/load/protocol-' + run + '.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
