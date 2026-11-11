// Javoblarni tekshiradi; to'g'ri javoblar soni va DTM ballini alohida hisoblaydi.
import { fail } from './http.mjs';
import { coefficientFor, scoringPolicy } from './scoring-policy.mjs';
export function grade(questions, answers, policy = { mode: 'normal' }) {
  if (typeof policy === 'string') policy = scoringPolicy(questions, policy);
  if (!Array.isArray(answers) || answers.length !== questions.length)
    fail('Javoblar soni savollar soniga mos emas.');
  answers.forEach((a, i) => {
    if (a !== null && (!Number.isInteger(a) || a < 0 || a >= questions[i].options.length))
      fail(i + 1 + "-javob noto'g'ri.");
  });
  const results = questions.map((q, i) => answers[i] === q.answer);
  const score = results.filter(Boolean).length;
  const normal = { score, correctCount: score, total: questions.length, results };
  if (policy.mode !== 'dtm') return normal;
  const units = questions.reduce(
    (sum, q, i) => sum + (results[i] ? coefficientFor(policy, q.section) : 0),
    0
  );
  return { ...normal, dtmScore: units / policy.scale, maxScore: policy.maxScore };
}
