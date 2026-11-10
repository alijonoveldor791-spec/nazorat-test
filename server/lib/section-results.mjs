// Har bir fan bo'limida amaldagi bir savolga bir ball qoidasini qo'llaydi.
export function sectionResults(questions, answers) {
  const sections = new Map();
  questions.forEach((q, index) => {
    if (!q.section) return;
    const row = sections.get(q.section.id) || { ...q.section, score: 0, total: 0 };
    row.total++;
    if (answers[index] === q.answer) row.score++;
    sections.set(row.id, row);
  });
  return [...sections.values()];
}
