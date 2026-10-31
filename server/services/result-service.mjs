// Natijalar ro’yxati, tafsiloti va qayta topshirish ruxsati.
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import { fail } from '../lib/http.mjs';
import { hash, norm } from '../lib/identity.mjs';
import { finalizeExpiredAttempts } from './completion-service.mjs';

export async function listResults() {
  await finalizeExpiredAttempts();
  return (await resultsRepo.list(true))
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(({ questions, answers, publicResult, ...result }) => result);
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
