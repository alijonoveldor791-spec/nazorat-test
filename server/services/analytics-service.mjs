// Tahriri mos natijalardan savollar kesimidagi statistikani hisoblaydi.
import * as resultsRepo from '../repositories/results-repo.mjs';
import { findTest } from './test-service.mjs';
import { questionView } from '../lib/rich-content.mjs';

export async function testAnalysis(id) {
  const test = await findTest(id);
  const results = (await resultsRepo.list(true)).filter(
    (r) => r.testId === test.id && r.questions?.length && r.revision === test.updated
  );
  const questions = test.questions.map((question, index) => {
    const distribution = question.options.map(() => 0);
    let correct = 0,
      unanswered = 0,
      count = 0;
    for (const result of results) {
      const position = result.questions.findIndex((q) => q.sourceIndex === index);
      if (position < 0) continue;
      count++;
      const choice = result.answers[position];
      if (choice === null || choice === undefined) {
        unanswered++;
        continue;
      }
      const snapshot = result.questions[position];
      const original = snapshot.sourceOptions?.[choice] ?? question.options.indexOf(snapshot.options[choice]);
      if (original >= 0) distribution[original]++;
      if (choice === snapshot.answer) correct++;
    }
    return {
      index,
      ...questionView(question),
      count,
      percent: count ? Math.round((correct / count) * 100) : 0,
      distribution,
      unanswered,
    };
  });
  return {
    title: test.title,
    attempts: results.length,
    questions,
    hardest: [...questions].sort((a, b) => a.percent - b.percent).slice(0, 5),
  };
}
