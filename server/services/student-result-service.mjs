// Har qaytarishda joriy ruxsatga qarab natija va kalit sharhini quradi.
import * as testsRepo from '../repositories/tests-repo.mjs';
import { sectionResults } from '../lib/section-results.mjs';
import { scoringPolicy } from '../lib/scoring-policy.mjs';
export async function studentResult(result) {
  const termination = { terminatedViolation: result.terminatedViolation === true };
  const test = await testsRepo.find(result.testId);
  if (test ? test.settings.hideResults === true : result.hideResults === true)
    return { ...termination, hidden: true, title: result.testTitle, timedOut: result.timedOut === true };
  const questions = result.questions || [],
    answers = result.answers || [];
  let sections = Array.isArray(result.sections) ? result.sections : [];
  if (
    !sections.length &&
    answers.length === questions.length &&
    questions.some((q) => q.section) &&
    questions.every((q) => Number.isInteger(q.answer))
  ) {
    try {
      const mode = result.scoringMode || (result.dtmScore !== undefined ? 'dtm' : 'normal');
      sections = sectionResults(questions, answers, result.scoringPolicy || scoringPolicy(questions, mode));
    } catch {
      // Eski to'liq bo'lmagan snapshot uchun taxminiy ball chiqarilmaydi.
    }
  }
  const response = {
    ...termination,
    sections,
    score: result.score,
    correctCount: result.correctCount ?? result.score,
    scoringMode: result.scoringMode || 'normal',
    total: result.total,
    title: result.testTitle,
    results: questions.map((q, i) => answers[i] === q.answer),
    timedOut: result.timedOut === true,
    ...(result.dtmScore !== undefined ? { dtmScore: result.dtmScore, maxScore: result.maxScore ?? 189 } : {}),
  };
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
