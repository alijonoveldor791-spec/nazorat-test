// Test mazmuni, sozlamalari va administrator amallari.
import { randomUUID } from 'node:crypto';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { listClasses } from './class-service.mjs';
import { fail } from '../lib/http.mjs';
import { norm } from '../lib/identity.mjs';
import { object, string, questionsValid, settingsValid, scheduleValid } from '../lib/validate.mjs';
import { parseAiken, toAiken } from '../lib/aiken-parser.mjs';
import { status, testMeta } from '../lib/test-status.mjs';

export async function findTest(id) {
  const test = await testsRepo.find(id);
  if (!test) fail('Test topilmadi.', 404);
  return test;
}
export function requireAvailable(test) {
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
  const ids = payload.classIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > 40 || ids.some((id) => typeof id !== 'string'))
    fail('1–40 ta sinf tanlang.');
  const classes = await listClasses(true),
    classIds = [...new Set(ids)];
  if (classIds.some((id) => !classes.some((c) => c.id === id))) fail('Sinf topilmadi.');
  const questions =
    payload.text !== undefined ? previewTest(payload.text).questions : questionsValid(payload.questions);
  const now = new Date().toISOString();
  const test = {
    id: old?.id || randomUUID(),
    title,
    classIds,
    grades: classIds.map((id) => classes.find((c) => c.id === id).name),
    questions,
    settings: settingsValid(payload.settings),
    schedule: scheduleValid(payload.schedule),
    active: old?.active ?? true,
    created: old?.created || now,
    updated: now,
  };
  await testsRepo.save(test);
  return testMeta(test);
}
export async function listTests() {
  return (await testsRepo.list(true)).sort((a, b) => b.created.localeCompare(a.created)).map(testMeta);
}
export async function publicTests(classId, grade) {
  if (!classId && grade) classId = (await listClasses()).find((c) => norm(c.name) === norm(grade))?.id;
  return (await testsRepo.list())
    .filter((t) => t.classIds.includes(classId) && status(t) === 'active')
    .map((t) => ({
      id: t.id,
      title: t.title,
      count: t.questions.length,
      settings: { timeLimitMin: t.settings.timeLimitMin, maxAttempts: t.settings.maxAttempts },
    }));
}
export async function publicTest(id) {
  const test = await findTest(id);
  requireAvailable(test);
  return {
    id: test.id,
    title: test.title,
    questions: test.questions.map((q) => ({ q: q.q, options: q.options })),
  };
}
export async function toggleTest(id) {
  const test = await findTest(id);
  test.active = !test.active;
  await testsRepo.save(test);
  return testMeta(test);
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
  return testMeta(copy);
}
export async function deleteTest(id) {
  await testsRepo.remove(id);
  return { ok: true };
}
export async function exportTest(id) {
  return toAiken((await findTest(id)).questions);
}
