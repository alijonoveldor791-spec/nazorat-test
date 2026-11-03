// Bir urinishga faqat bitta natija; muddati tugasa oxirgi server drafti baholanadi.
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { grade } from '../lib/grade.mjs';
import { endTime, scheduledAttempt } from './attempt-access-service.mjs';
import { integer } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';

export async function completeAttempt(attempt, answers, timedOut = false, version) {
  const resultId = attempt.id.split('/').at(-1),
    stored = await resultsRepo.find(resultId);
  if (stored) {
    if (!attempt.finished)
      await attemptsRepo.update(attempt.id, (current) => ({ ...current, finished: true }));
    return stored;
  }
  if (version !== undefined) integer(version, 'Javob versiyasi', 0, 1_000_000_000);
  if (answers !== undefined && !timedOut && Date.now() < endTime(attempt)) grade(attempt.questions, answers);
  // Draft ham, yakunlash ham aynan urinish ETagi uchun kurashadi.
  const frozen = await attemptsRepo.update(attempt.id, (current) => {
    if (current.finished) return current;
    if (current.completion) return current;
    const now = Date.now(),
      deadline = Math.min(endTime(current), endTime(attempt));
    const expired = now >= deadline;
    if (timedOut && !expired) fail('Urinish muddati hali tugamagan.', 409);
    const useDraft = expired || (version !== undefined && version <= (current.draftVersion || 0));
    const accepted = useDraft ? current.answers || Array(current.questions.length).fill(null) : answers;
    grade(current.questions, accepted);
    return {
      ...current,
      answers: accepted,
      draftVersion: useDraft ? current.draftVersion || 0 : (version ?? current.draftVersion ?? 0),
      completion: { timedOut: expired, finishedAt: expired ? deadline : now },
    };
  });
  if (frozen.finished) {
    const saved = await resultsRepo.find(resultId);
    if (!saved) fail("Urinish yakunlangan yoki natija o'chirilgan.", 409);
    return saved;
  }
  const scored = grade(frozen.questions, frozen.answers);
  const finishedAt = frozen.completion.finishedAt;
  attempt = frozen;
  answers = frozen.answers;
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
    score: scored.score,
    total: scored.total,
    answers,
    questions: attempt.questions,
    revision: attempt.revision,
    ...(attempt.importSourceId ? { importSourceId: attempt.importSourceId } : {}),
    showAnswersAllowed: !!attempt.settings.showAnswers,
    durationSec: Math.max(0, Math.round((finishedAt - Date.parse(attempt.started)) / 1000)),
    time: new Date(finishedAt).toISOString(),
    timedOut: frozen.completion.timedOut,
  };
  const created = await resultsRepo.create(result);
  await attemptsRepo.update(attempt.id, (current) => ({ ...current, finished: true }));
  return created ? result : resultsRepo.find(resultId);
}
export async function completeExpired(attempt) {
  if (attempt.completion && !attempt.finished) return completeAttempt(attempt);
  if (attempt.finished || Date.now() < endTime(attempt)) return null;
  return completeAttempt(attempt, undefined, true);
}
export async function finalizeExpiredAttempts() {
  const tests = new Map();
  for (const item of await attemptsRepo.listPending()) {
    const attempt = await attemptsRepo.find(item.id);
    if (!attempt || attempt.finished) {
      await attemptsRepo.removePending(item.id);
      continue;
    }
    if (attempt.completion) {
      await completeAttempt(attempt);
      continue;
    }
    if (!tests.has(item.testId)) tests.set(item.testId, await testsRepo.find(item.testId));
    const test = tests.get(item.testId);
    if (!test) {
      await attemptsRepo.removePending(item.id);
      continue;
    }
    if (Math.min(item.end, test.schedule?.end ? Date.parse(test.schedule.end) : Infinity) > Date.now())
      continue;
    await completeExpired(scheduledAttempt(attempt, test));
  }
}
