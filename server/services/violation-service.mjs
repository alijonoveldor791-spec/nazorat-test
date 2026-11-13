// Egalik tekshiruvi, server sanog'i va qayta yuborishga chidamli qoidabuzarlik yakuni.
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import { accessAttempt, endTime, scheduledAttempt } from './attempt-access-service.mjs';
import { completeAttempt, completeExpired } from './completion-service.mjs';
import { studentResult } from './student-result-service.mjs';
import { findTest, requireAvailable } from './test-service.mjs';
import { grade } from '../lib/grade.mjs';
import { integer, string } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
import { violationLimit } from '../migrations/exam-violations.mjs';
const TYPES = new Set(['printscreen', 'shortcut', 'blur', 'visibility', 'fullscreen']);
const FOCUS_TYPES = new Set(['blur', 'visibility', 'fullscreen']);
const DEBOUNCE_MS = 1500;
export async function reportViolation(payload) {
  let attempt = await accessAttempt(payload);
  await limit('violation-attempt', attempt.id, 60);
  const stored = await resultsRepo.find(attempt.id.split('/').at(-1));
  if (stored) return { result: await studentResult(stored) };
  if (attempt.completionSnapshot || attempt.terminatedViolation)
    return { result: await studentResult(await completeAttempt(attempt, attempt.answers)) };
  if (attempt.finished) fail('Bu urinish yakunlangan.', 409);
  const test = await findTest(attempt.testId);
  attempt = scheduledAttempt(attempt, test);
  const expired = await completeExpired(attempt);
  if (expired) return { result: await studentResult(expired) };
  requireAvailable(test);
  const eventId = string(payload.eventId, 'Hodisa ID', 64);
  if (!/^[a-f0-9-]{36}$/i.test(eventId) || !TYPES.has(payload.type)) fail('Hodisa yaroqsiz.');
  const version = integer(payload.version, 'Javob versiyasi', 0, 1_000_000_000);
  grade(attempt.questions, payload.answers);
  const saved = await attemptsRepo.update(attempt.id, (current) => {
    if (current.finished || current.terminatedViolation) return current;
    if (Date.now() >= endTime(scheduledAttempt(current, test))) return current;
    const log = current.violationLog || [];
    if ((current.violationEventIds || []).includes(eventId) || log.some((event) => event.id === eventId))
      return current;
    const last = log.at(-1);
    if (
      last &&
      FOCUS_TYPES.has(last.type) &&
      FOCUS_TYPES.has(payload.type) &&
      Date.now() - Date.parse(last.at) < DEBOUNCE_MS
    )
      return { ...current, violationEventIds: [...(current.violationEventIds || []), eventId].slice(-100) };
    const at = new Date().toISOString();
    const count = (current.violationCount || 0) + 1;
    const terminated = count >= violationLimit(current.settings);
    return {
      ...current,
      ...(version > (current.draftVersion || 0) ? { answers: payload.answers, draftVersion: version } : {}),
      violationEventIds: [...(current.violationEventIds || []), eventId].slice(-100),
      violationCount: count,
      violationLog: [
        ...log,
        {
          id: eventId,
          type: payload.type,
          at,
          studentId: current.identity.studentId,
          identityKey: current.identity.key,
        },
      ],
      terminatedViolation: terminated,
      ...(terminated ? { finished: true, terminationTime: at } : {}),
    };
  });
  const full = scheduledAttempt(await attemptsRepo.find(saved.id), test);
  const result =
    full.terminatedViolation || full.completionSnapshot
      ? await completeAttempt(full, full.answers)
      : await completeExpired(full);
  return {
    violationCount: saved.violationCount,
    violationLimit: violationLimit(saved.settings),
    ...(result ? { result: await studentResult(result) } : {}),
  };
}
