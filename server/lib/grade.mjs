// lib/grade.mjs: serverdagi shu qatlam vazifasi.
import { fail } from './http.mjs';
export function grade(questions, answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length)
    fail('Javoblar soni savollar soniga mos emas.');
  answers.forEach((a, i) => {
    if (a !== null && (!Number.isInteger(a) || a < 0 || a >= questions[i].options.length))
      fail(`${i + 1}-javob noto'g'ri.`);
  });
  const results = questions.map((q, i) => answers[i] === q.answer);
  return { score: results.filter(Boolean).length, total: questions.length, results };
}
