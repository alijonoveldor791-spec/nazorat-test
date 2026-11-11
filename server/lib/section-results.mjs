// Fanlar bo'yicha to'g'ri javoblar va butun birliklarda hisoblangan ballarni ajratadi.
import { coefficientFor, scoringPolicy } from './scoring-policy.mjs';
export function sectionResults(questions, answers, policy = { mode: 'normal' }) {
  if (typeof policy === 'string') policy = scoringPolicy(questions, policy);
  const sections = new Map();
  questions.forEach((q, index) => {
    if (!q.section) return;
    const row = sections.get(q.section.id) || { ...q.section, correctCount: 0, answeredCount: 0, total: 0 };
    row.total++;
    if (answers[index] !== null && answers[index] !== undefined) row.answeredCount++;
    if (answers[index] === q.answer) row.correctCount++;
    sections.set(row.id, row);
  });
  return [...sections.values()].map((row) => {
    const coefficientUnits = policy.mode === 'dtm' ? coefficientFor(policy, row) : 10;
    return {
      ...row,
      coefficientUnits,
      score: (row.correctCount * coefficientUnits) / 10,
      maxScore: (row.total * coefficientUnits) / 10,
    };
  });
}
