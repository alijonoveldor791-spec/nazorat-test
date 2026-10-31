// Submit va qayta yuborishda joriy siyosat bilan bir xil natijani qaytaradi.
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import { accessAttempt, endTime, scheduledAttempt } from './attempt-access-service.mjs';
import { completeAttempt, completeExpired } from './completion-service.mjs';
import { studentResult } from './student-result-service.mjs';
import { findTest } from './test-service.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
export { grade } from '../lib/grade.mjs';
export async function submitAttempt(payload, ip) {
  await limit('submit', ip, 600);
  let attempt = await accessAttempt(payload);
  await limit('submit-attempt', attempt.id, 20);
  const stored = await resultsRepo.find(attempt.id.split('/').at(-1));
  if (stored) {
    if (!attempt.finished)
      await attemptsRepo.update(attempt.id, (current) => ({ ...current, finished: true }));
    return studentResult(stored);
  }
  if (attempt.finished) fail('Bu urinish yakunlangan.', 409);
  const test = await findTest(attempt.testId);
  attempt = scheduledAttempt(attempt, test);
  if (Date.now() >= endTime(attempt)) return studentResult(await completeExpired(attempt));
  if (!test.active || !test.classIds.includes(attempt.identity.classId))
    fail('Test yoki sinf hozir ochiq emas.', 403);
  return studentResult(await completeAttempt(attempt, payload.answers));
}
