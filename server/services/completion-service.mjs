// Bir urinishga faqat bitta natija; muddati tugasa oxirgi server drafti baholanadi.
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { sectionResults } from '../lib/section-results.mjs';
import { scoringPolicy } from '../lib/scoring-policy.mjs';
import { grade } from '../lib/grade.mjs';
import { endTime, scheduledAttempt } from './attempt-access-service.mjs';

export async function completeAttempt(attempt, answers, timedOut = false) {
  const resultId = attempt.id.split('/').at(-1),
    stored = await resultsRepo.find(resultId);
  if (stored) {
    if (!attempt.finished)
      await attemptsRepo.update(attempt.id, (current) => ({ ...current, finished: true }));
    return stored;
  }
  if (!timedOut && Date.now() >= endTime(attempt)) {
    timedOut = true;
    const current = await attemptsRepo.find(attempt.id);
    answers = current.answers || Array(current.questions.length).fill(null);
  }
  const policy = attempt.scoringPolicy || scoringPolicy(attempt.questions, attempt.settings.scoringMode);
  const scored = grade(attempt.questions, answers, policy);
  const finishedAt = timedOut ? Math.min(Date.now(), endTime(attempt)) : Date.now();
  const result = {
    id: resultId,
    attemptId: attempt.id,
    testId: attempt.testId,
    testTitle: attempt.title,
    classId: attempt.identity.classId,
    grade: attempt.identity.grade,
    name: attempt.identity.name,
    surname: attempt.identity.surname,
    studentId: attempt.identity.studentId,
    identityKey: attempt.identity.key,
    sections: sectionResults(attempt.questions, answers, policy),
    score: scored.score,
    correctCount: scored.correctCount,
    scoringMode: policy.mode,
    scoringPolicy: policy,
    total: scored.total,
    answers,
    questions: attempt.questions,
    revision: attempt.revision,
    showAnswersAllowed: !!attempt.settings.showAnswers,
    durationSec: Math.max(0, Math.round((finishedAt - Date.parse(attempt.started)) / 1000)),
    time: new Date(finishedAt).toISOString(),
    timedOut,
    ...(policy.mode === 'dtm' ? { dtmScore: scored.dtmScore, maxScore: scored.maxScore } : {}),
  };
  const created = await resultsRepo.create(result);
  await attemptsRepo.update(attempt.id, (current) => ({ ...current, finished: true }));
  return created ? result : resultsRepo.find(resultId);
}
export async function completeExpired(attempt) {
  if (attempt.finished || Date.now() < endTime(attempt)) return null;
  const current = await attemptsRepo.find(attempt.id);
  return completeAttempt(
    { ...current, deadline: attempt.deadline },
    current.answers || Array(current.questions.length).fill(null),
    true
  );
}
export async function finalizeExpiredAttempts() {
  const tests = new Map();
  for (const item of await attemptsRepo.listPending()) {
    if (!tests.has(item.testId)) tests.set(item.testId, await testsRepo.find(item.testId));
    const test = tests.get(item.testId);
    if (!test) {
      await attemptsRepo.removePending(item.id);
      continue;
    }
    if (Math.min(item.end, test.schedule?.end ? Date.parse(test.schedule.end) : Infinity) > Date.now())
      continue;
    const attempt = await attemptsRepo.find(item.id);
    if (attempt?.finished) {
      await attemptsRepo.removePending(item.id);
      continue;
    }
    if (attempt) await completeExpired(scheduledAttempt(attempt, test));
    else await attemptsRepo.removePending(item.id);
  }
}
