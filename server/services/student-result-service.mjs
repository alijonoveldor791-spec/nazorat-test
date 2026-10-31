// Har qaytarishda joriy ruxsatga qarab natija va kalit sharhini quradi.
import * as testsRepo from '../repositories/tests-repo.mjs';
export async function studentResult(result) {
  const questions = result.questions || [],
    answers = result.answers || [];
  const response = {
    score: result.score,
    total: result.total,
    title: result.testTitle,
    results: questions.map((q, i) => answers[i] === q.answer),
    timedOut: result.timedOut === true,
  };
  const test = await testsRepo.find(result.testId);
  const allowed =
    result.showAnswersAllowed === true ||
    (result.showAnswersAllowed === undefined && Array.isArray(result.publicResult?.review));
  if (test?.settings.showAnswers && allowed)
    response.review = questions.map((q, i) => ({
      q: q.q,
      options: q.options,
      answer: q.answer,
      selected: answers[i] ?? null,
    }));
  return response;
}
