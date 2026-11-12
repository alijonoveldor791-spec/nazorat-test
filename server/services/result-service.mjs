// Natijalar ro'yxati, tafsiloti va qayta topshirish ruxsati.
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import { fail } from '../lib/http.mjs';
import { hash, norm } from '../lib/identity.mjs';
import { finalizeExpiredAttempts } from './completion-service.mjs';

export async function listResults({ testId = '', classId = '' } = {}) {
  await finalizeExpiredAttempts();
  return (await resultsRepo.listSummaries())
    .filter((row) => (!testId || row.testId === testId) && (!classId || row.classId === classId))
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(({ questions, answers, publicResult, ...result }) => result);
}
export async function recentResults() {
  const groups = new Map();
  for (const row of await listResults()) {
    const key = JSON.stringify([row.testId, row.classId]);
    if (!groups.has(key))
      groups.set(key, {
        testId: row.testId,
        classId: row.classId || '',
        testTitle: row.testTitle,
        grade: row.grade,
        time: row.time,
        count: 0,
      });
    groups.get(key).count++;
  }
  return [...groups.values()].slice(0, 10);
}
export async function findResult(id) {
  const result = await resultsRepo.find(id);
  if (!result) fail('Natija topilmadi.', 404);
  return result;
}
export async function deleteResult(id) {
  await findResult(id);
  await resultsRepo.remove(id);
  return { ok: true };
}
export async function allowRetake(id) {
  const row = await findResult(id);
  const key =
    row.identityKey || hash(row.testId + '|' + row.classId + '|' + norm(row.surname + ' ' + row.name));
  await retakesRepo.grant(key);
  return { ok: true };
}
