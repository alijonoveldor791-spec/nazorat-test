// Har qaytarishda joriy ruxsatga qarab natija va kalit sharhini quradi.
import * as testsRepo from '../repositories/tests-repo.mjs';
export async function studentResult(result) {
  const questions = result.questions || [],
    answers = result.answers || [];
  const response = {
    sections: result.sections || [],
    score: result.score,
    correctCount: result.correctCount ?? result.score,
    scoringMode: result.scoringMode || 'normal',
    total: result.total,
    title: result.testTitle,
    results: questions.map((q, i) => answers[i] === q.answer),
    timedOut: result.timedOut === true,
    ...(result.dtmScore !== undefined ? { dtmScore: result.dtmScore, maxScore: result.maxScore ?? 189 } : {}),
  };
  const test = await testsRepo.find(result.testId);
  const allowed =
    result.showAnswersAllowed === true ||
    (result.showAnswersAllowed === undefined && Array.isArray(result.publicResult?.review));
  if (test?.settings.showAnswers && allowed)
    response.review = questions.map((q, i) => ({
      ...(q.contentFormat ? { contentFormat: q.contentFormat } : {}),
      q: q.q,
      options: q.options,
      answer: q.answer,
      selected: answers[i] ?? null,
    }));
  return response;
}
