// Faqat tayyor test snapshotini moderatsiya qiladi va oluvchi maktabga mustaqil nusxa beradi.
import { randomUUID } from 'node:crypto';
import * as repo from '../repositories/library-repo.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import { currentAccess, requireRole } from '../lib/access-context.mjs';
import { findTest } from './test-service.mjs';
import { requireBank } from './bank-policy-service.mjs';
import { fail } from '../lib/http.mjs';
import { questionsValid, string } from '../lib/validate.mjs';
const meta = (row) => ({
  id: row.id,
  title: row.title,
  subject: row.subject,
  count: row.questions.length,
  status: row.status,
});
export async function submitShared(id) {
  const test = await findTest(id);
  if (test.origin?.type === 'shared') fail('Olingan testni qayta ulashish mumkin emas.', 403);
  const entry = {
    id: randomUUID(),
    title: test.title,
    subject: test.subject,
    questions: questionsValid(test.questions),
    status: 'pending',
    tariffIds: [],
    schoolIds: [],
    sourceSchoolId: test.schoolId,
    sourceTestId: test.id,
    createdAt: new Date().toISOString(),
  };
  await repo.createShared(entry);
  return meta(entry);
}
export async function listShared() {
  const access = await requireBank('view');
  return (await repo.shared())
    .filter(
      (t) =>
        t.status === 'approved' &&
        (t.schoolIds.includes(access.schoolId) || t.tariffIds.includes(access.tariffId))
    )
    .map(meta);
}
export async function findShared(id, action) {
  const entry = await repo.sharedTest(id);
  if (!entry || entry.status !== 'approved') fail('Test topilmadi.', 404);
  await requireBank(action, entry);
  return entry;
}
export async function takeShared(id) {
  const entry = await findShared(id, 'take');
  const now = new Date().toISOString();
  const test = {
    id: randomUUID(),
    schoolId: currentAccess().schoolId,
    title: entry.title,
    subject: entry.subject,
    questions: structuredClone(entry.questions),
    origin: { type: 'shared', sharedId: entry.id },
    testType: 'ordinary',
    direction: '',
    classIds: [],
    grades: [],
    settings: {
      timeLimitMin: 30,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showAnswers: false,
      hideResults: false,
      scoringMode: 'normal',
    },
    active: false,
    schedule: { start: null, end: null },
    created: now,
    createdAt: now,
    updated: now,
  };
  await tests.create(test);
  return { id: test.id };
}
export async function reviewQueue() {
  requireRole(currentAccess(), ['super_admin']);
  return repo.shared();
}
export async function moderateShared(id, input) {
  requireRole(currentAccess(), ['super_admin']);
  if (!['approved', 'rejected'].includes(input.status)) fail("Holat noto'g'ri.");
  const ids = (value) => {
    if (!Array.isArray(value) || value.length > 500) fail("ID ro'yxati kerak.");
    return [...new Set(value.map((v) => string(v, 'ID', 100)))];
  };
  const tariffIds = ids(input.tariffIds || []),
    schoolIds = ids(input.schoolIds || []);
  return repo.updateShared(id, (row) => {
    if (!row) fail('Test topilmadi.', 404);
    return { ...row, status: input.status, tariffIds, schoolIds };
  });
}
