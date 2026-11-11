// Muddatdan oldingi, tartib raqami bilan kelgan javoblarni serverga saqlaydi.
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import { accessAttempt, endTime, scheduledAttempt } from './attempt-access-service.mjs';
import { completeExpired } from './completion-service.mjs';
import { studentResult } from './student-result-service.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import { grade } from '../lib/grade.mjs';
import { integer } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
import { findTest, requireAvailable } from './test-service.mjs';

export async function saveDraft(payload, ip) {
  const attempt = await accessAttempt(payload, { includeQuestions: false });
  await limit('draft-attempt', attempt.id, 60);
  const version = integer(payload.version, 'Javob versiyasi', 1, 1_000_000_000);
  grade(
    attempt.questions || attempt.questionShape.map((count) => ({ options: Array(count) })),
    payload.answers
  );
  const test = await findTest(attempt.testId);
  requireAvailable(test);
  const saved = await attemptsRepo.update(attempt.id, (current) => {
    if (current.finished || Date.now() >= endTime(scheduledAttempt(current, test)))
      fail('Javob yozish muddati tugagan.', 409);
    if (version <= (current.draftVersion || 0)) return current;
    return { ...current, answers: payload.answers, draftVersion: version };
  });
  return { draftVersion: saved.draftVersion, serverNow: new Date().toISOString() };
}
export async function resumeAttempt(payload, ip) {
  let attempt = await accessAttempt(payload, { includeQuestions: false });
  await limit('resume-attempt', attempt.id, 30);
  let result = await resultsRepo.find(attempt.id.split('/').at(-1));
  let test;
  if (!result) {
    test = await findTest(attempt.testId);
    attempt = scheduledAttempt(attempt, test);
    result = await completeExpired(attempt);
  }
  if (result) {
    if (!attempt.finished)
      await attemptsRepo.update(attempt.id, (current) => ({ ...current, finished: true }));
    return { result: await studentResult(result), serverNow: new Date().toISOString() };
  }
  if (attempt.finished) fail("Urinish yakunlangan yoki natija o'chirilgan.", 409);
  requireAvailable(test);
  return {
    answers: attempt.answers || Array(attempt.questions.length).fill(null),
    draftVersion: attempt.draftVersion || 0,
    deadline: attempt.deadline,
    serverNow: new Date().toISOString(),
    started: attempt.started,
  };
}
