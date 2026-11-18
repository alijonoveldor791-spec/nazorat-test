// Filtrlangan barcha natijalar uchun sahifalashdan mustaqil statistika.
import { norm as normalize } from './identity.mjs';
export function summarizeResults(rows) {
  const people = new Set(),
    classes = new Set(),
    tests = new Map();
  let percentSum = 0,
    scored = 0,
    submissions = 0,
    inProgress = 0,
    notStarted = 0;
  for (const row of rows) {
    const classKey = row.classId || normalize(row.grade);
    classes.add(classKey);
    // Bir odamning qayta topshirishlari va boshqa testlari bitta qatnashchi sanaladi.
    people.add(
      JSON.stringify([
        classKey,
        normalize(`${row.surname || ''} ${row.name || ''}`) || row.studentId || row.id,
      ])
    );
    if (row.hasResult === false) {
      if (row.submissionStatus === 'in-progress') inProgress++;
      if (row.submissionStatus === 'not-started') notStarted++;
    } else submissions++;
    if (row.hasResult !== false && row.total > 0 && Number.isFinite(row.score)) {
      percentSum += (row.score / row.total) * 100;
      scored++;
    }
    if (!tests.has(row.testId))
      tests.set(row.testId, {
        testId: row.testId,
        testTitle: row.testTitle || "O'chirilgan test",
        time: row.time,
        count: 0,
        grades: new Set(),
      });
    const test = tests.get(row.testId);
    if (row.hasResult !== false) test.count++;
    if (String(row.time) > String(test.time)) test.time = row.time;
    test.grades.add(row.grade || 'Guruhsiz');
  }
  const catalogue = [...tests.values()]
    .sort((a, b) => String(b.time).localeCompare(String(a.time)))
    .map(({ grades, ...test }) => ({ ...test, grade: [...grades].join(', ') }));
  return {
    tests: tests.size,
    classes: classes.size,
    submissions,
    inProgress,
    notStarted,
    participants: people.size,
    averagePercent: scored ? Math.round(percentSum / scored) : null,
    recent: catalogue.slice(0, 5),
    catalogue,
  };
}
