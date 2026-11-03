// Natijalar ro'yxati, tafsiloti va qayta topshirish ruxsati.
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import { fail } from '../lib/http.mjs';
import { hash, norm } from '../lib/identity.mjs';
import { finalizeExpiredAttempts } from './completion-service.mjs';
import { string } from '../lib/validate.mjs';

export async function listResults() {
  await finalizeExpiredAttempts();
  return (await resultsRepo.list(true))
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(({ questions, answers, publicResult, importSourceId, ...result }) => result);
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
export async function allowRetake(id, payload = {}) {
  const row = await findResult(id);
  const key =
    row.identityKey || hash(row.testId + '|' + row.classId + '|' + norm(row.surname + ' ' + row.name));
  const requestId = payload.requestId === undefined ? null : string(payload.requestId, 'Ruxsat ID', 100);
  if (requestId && !/^[a-f0-9-]{32,100}$/i.test(requestId)) fail('Ruxsat ID yaroqsiz.');
  await retakesRepo.grant(key, requestId);
  return { ok: true };
}
