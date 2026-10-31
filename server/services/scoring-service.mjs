// Javoblarni faqat serverdagi urinish nusxasi asosida baholaydi.
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import { findTest } from './test-service.mjs';
import { fail } from '../lib/http.mjs';
import { secret } from '../lib/env.mjs';
import { verify } from '../lib/auth-token.mjs';
import { grade } from '../lib/grade.mjs';
import { limit } from '../lib/rate-limit.mjs';
export { grade } from '../lib/grade.mjs';

export async function submitAttempt(payload, ip) {
  await limit('submit', ip, 80);
  const claim = verify(payload.attemptToken, secret(), 'attempt');
  const attempt = await attemptsRepo.find(claim.id);
  if (!attempt) fail('Urinish topilmadi.', 404);
  const resultId = claim.id.split('/').at(-1),
    stored = await resultsRepo.find(resultId);
  if (stored) return stored.publicResult;
  if (attempt.finished) fail('Bu urinish yakunlangan.', 409);
  const test = await findTest(attempt.testId),
    now = Date.now();
  if (
    !test.active ||
    (test.schedule.start && Date.parse(test.schedule.start) > now) ||
    (test.schedule.end && now > Date.parse(test.schedule.end) + 30000)
  )
    fail('Test hozir ochiq emas.', 403);
  if (!test.classIds.includes(attempt.identity.classId)) fail('Sinf testdan chiqarilgan.', 403);
  if (now > attempt.expires) fail('Test vaqti tugagan. O’qituvchiga murojaat qiling.', 403);
  const scored = grade(attempt.questions, payload.answers);
  const durationSec = Math.max(0, Math.round((now - Date.parse(attempt.started)) / 1000));
  const publicResult = { ...scored, title: attempt.title };
  if (attempt.settings.showAnswers && test.settings.showAnswers)
    publicResult.review = attempt.questions.map((q, i) => ({
      q: q.q,
      options: q.options,
      answer: q.answer,
      selected: payload.answers[i],
    }));
  const result = {
    id: resultId,
    attemptId: attempt.id,
    testId: test.id,
    testTitle: attempt.title,
    classId: attempt.identity.classId,
    grade: attempt.identity.grade,
    name: attempt.identity.name,
    surname: attempt.identity.surname,
    studentId: attempt.identity.studentId,
    identityKey: attempt.identity.key,
    score: scored.score,
    total: scored.total,
    answers: payload.answers,
    questions: attempt.questions,
    revision: attempt.revision,
    durationSec,
    time: new Date(now).toISOString(),
    publicResult,
  };
  const created = await resultsRepo.create(result);
  await attemptsRepo.save({ ...attempt, finished: true });
  return created ? publicResult : (await resultsRepo.find(resultId)).publicResult;
}
