// Maktab natijalarini serverda qidirish, sahifalash va qisqa statistika.
import { summarizeResults } from '../lib/result-summary.mjs';
import { listResults } from './result-service.mjs';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { listClasses } from './class-service.mjs';
import { fail } from '../lib/http.mjs';
import { filterResultRows, sortResultRows } from '../lib/result-filters.mjs';
import { withParticipation } from './result-participation-service.mjs';
export function queryResultRows(rows, params) {
  const selected = sortResultRows(filterResultRows(rows, params), params.get('sort') || 'time');
  const requested = Number(params.get('page') || 1);
  const pageSize = Number(params.get('pageSize') || 20);
  if (
    !Number.isSafeInteger(requested) ||
    requested < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 200
  )
    fail("Sahifa parametrlari noto'g'ri.", 400);
  const total = selected.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requested, pages);
  const items = selected.slice((page - 1) * pageSize, page * pageSize).map((r) => ({
    id: r.id,
    testId: r.testId,
    testTitle: r.testTitle,
    classId: r.classId,
    grade: r.grade,
    surname: r.surname,
    name: r.name,
    time: r.time,
    score: r.score,
    total: r.total,
    correctCount: r.correctCount,
    scoringMode: r.scoringMode,
    dtmScore: r.dtmScore,
    maxScore: r.maxScore,
    sections: r.sections,
    studentId: r.studentId,
    violationCount: r.violationCount || 0,
    terminatedViolation: r.terminatedViolation === true,
    hasResult: r.hasResult !== false,
    submissionStatus: r.submissionStatus || (r.terminatedViolation ? 'terminated' : 'submitted'),
    hasPreviousResult: r.hasPreviousResult === true,
  }));
  return { items, total, page, pageSize, pages, summary: summarizeResults(selected) };
}
export async function pagedResults(params) {
  const { rows, notice } = await withParticipation(await listResults(), params);
  return { ...queryResultRows(rows, params), notice };
}
export async function resultOverview() {
  const [rows, tests, classes] = await Promise.all([listResults(), testsRepo.list(), listClasses()]);
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.testId))
      groups.set(row.testId, {
        testId: row.testId,
        testTitle: row.testTitle || "O'chirilgan test",
        time: row.time,
        count: 0,
        classes: new Map(),
      });
    const item = groups.get(row.testId);
    item.count++;
    item.classes.set(row.classId || row.grade, row.grade || 'Guruhsiz');
  }
  const catalogue = [...groups.values()].map(({ classes: names, ...item }) => ({
    ...item,
    grade: [...names.values()].join(', '),
  }));
  return {
    counts: { tests: tests.length, submissions: rows.length, classes: classes.length },
    recent: catalogue.slice(0, 5),
    catalogue,
  };
}
