// Test mazmuni, sozlamalari va administrator amallari.
import { randomUUID } from 'node:crypto';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { listClasses } from './class-service.mjs';
import { fail } from '../lib/http.mjs';
import { norm } from '../lib/identity.mjs';
import { hash } from '../lib/identity.mjs';
import { object, string, questionsValid, settingsValid, scheduleValid } from '../lib/validate.mjs';
import { parseAiken, toAiken } from '../lib/aiken-parser.mjs';
import { status, testMeta } from '../lib/test-status.mjs';
import { currentAccess } from '../lib/access-context.mjs';
import { testCodeFor } from './test-code-service.mjs';
import { questionView } from '../lib/rich-content.mjs';
import { requireImportSource } from './docx-import-service.mjs';

async function adminMeta(test) {
  const testCode = await testCodeFor(test);
  return { ...testMeta(test), ...(testCode ? { testCode } : {}) };
}
export async function findAdminTest(id) {
  const test = await findTest(id);
  const testCode = await testCodeFor(test);
  return { ...test, ...(testCode ? { testCode } : {}) };
}

export async function findTest(id) {
  const test = await testsRepo.find(id);
  if (!test) fail('Test topilmadi.', 404);
  return test;
}
export function requireAvailable(test) {
  try {
    questionsValid(test.questions);
  } catch {
    fail("Test savollari yaroqsiz yoki bo'sh. O'qituvchiga murojaat qiling.", 400);
  }
  if (status(test) !== 'active') fail('Test hozir ochiq emas. Jadval yoki holatni tekshiring.', 403);
}
export function previewTest(text) {
  try {
    return { questions: parseAiken(text) };
  } catch (error) {
    fail(error.message);
  }
}
export async function saveTest(payload, id) {
  object(payload);
  const old = id ? await findTest(id) : null;
  const title = string(payload.title, 'Test nomi', 100);
  const subject = string(payload.subject ?? old?.subject ?? '', 'Fan', 100, false);
  const ids = payload.classIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > 40 || ids.some((id) => typeof id !== 'string'))
    fail('1–40 ta sinf tanlang.');
  const classes = await listClasses(true),
    classIds = [...new Set(ids)];
  if (classIds.some((id) => !classes.some((c) => c.id === id))) fail('Sinf topilmadi.');
  const questions =
    payload.text !== undefined ? previewTest(payload.text).questions : questionsValid(payload.questions);
  if (Buffer.byteLength(JSON.stringify(questions)) > 2_000_000) fail('Savollar jami 2 MB dan oshmasin.');
  const importSourceId = payload.importSourceId
    ? await requireImportSource(payload.importSourceId)
    : payload.importSourceId === null
      ? undefined
      : old?.importSourceId;
  let requestId = null;
  const requestHash = hash(
    JSON.stringify({
      title,
      classIds,
      questions,
      settings: payload.settings,
      schedule: payload.schedule,
      ...(subject ? { subject } : {}),
      ...(importSourceId ? { importSourceId } : {}),
    })
  );
  if (!id && payload.requestId !== undefined) {
    requestId = string(payload.requestId, "So'rov ID", 36);
    if (!/^[a-f0-9-]{36}$/i.test(requestId)) fail("So'rov ID noto'g'ri.");
    const existing = await testsRepo.find(requestId);
    if (existing) {
      if (existing.creationRequestHash !== requestHash)
        fail("Bu so'rov allaqachon boshqa testni saqlagan.", 409);
      return adminMeta(existing);
    }
  }
  const now = new Date().toISOString();
  const test = {
    id: old?.id || requestId || randomUUID(),
    ...(currentAccess()?.schoolId ? { schoolId: currentAccess().schoolId } : {}),
    title,
    subject,
    classIds,
    grades: classIds.map((id) => classes.find((c) => c.id === id).name),
    questions,
    settings: settingsValid(payload.settings),
    schedule: scheduleValid(payload.schedule),
    active:
      importSourceId && importSourceId !== old?.importSourceId
        ? false
        : (old?.active ?? !questions.some((q) => q.rich)),
    ...(importSourceId ? { importSourceId } : {}),
    created: old?.created || now,
    updated: now,
    ...(!old ? { creationRequestHash: requestHash } : {}),
  };
  if (requestId) {
    if (!(await testsRepo.create(test))) {
      const existing = await testsRepo.find(requestId);
      if (!existing) fail("Ma'lumot topilmadi yoki unga kirish mumkin emas.", 404);
      if (existing.creationRequestHash !== requestHash) fail("So'rov boshqa testga tegishli.", 409);
      return adminMeta(existing);
    }
  } else await testsRepo.save(test);
  return adminMeta(test);
}
export async function listTests() {
  return Promise.all(
    (await testsRepo.list(true)).sort((a, b) => b.created.localeCompare(a.created)).map(adminMeta)
  );
}
export async function publicTests(classId, grade) {
  if (!classId && grade) classId = (await listClasses()).find((c) => norm(c.name) === norm(grade))?.id;
  return (await testsRepo.list())
    .filter((t) => t.classIds.includes(classId) && status(t) === 'active' && usableTest(t))
    .map((t) => ({
      id: t.id,
      title: t.title,
      count: t.questions.length,
      settings: { timeLimitMin: t.settings.timeLimitMin, maxAttempts: t.settings.maxAttempts },
    }));
}
export function usableTest(test) {
  try {
    questionsValid(test.questions);
    return true;
  } catch {
    return false;
  }
}
export async function publicTest(id) {
  const test = await findTest(id);
  requireAvailable(test);
  return {
    id: test.id,
    title: test.title,
    questions: test.questions.map(questionView),
  };
}
export async function toggleTest(id) {
  const test = await findTest(id);
  test.active = !test.active;
  await testsRepo.save(test);
  return adminMeta(test);
}
export async function duplicateTest(id) {
  const test = await findTest(id),
    now = new Date().toISOString();
  const copy = {
    ...test,
    id: randomUUID(),
    title: (test.title + ' — nusxa').slice(0, 100),
    active: false,
    created: now,
    updated: now,
  };
  await testsRepo.save(copy);
  return adminMeta(copy);
}
export async function deleteTest(id) {
  await testsRepo.remove(id);
  return { ok: true };
}
export async function exportTest(id) {
  const test = await findTest(id);
  if (test.questions.some((q) => q.rich))
    fail(
      "Word formulali testni Aiken matniga yoqotishsiz eksport qilib bo'lmaydi. Zaxira JSONdan foydalaning."
    );
  return toAiken(test.questions);
}
