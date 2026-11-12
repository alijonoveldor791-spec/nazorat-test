// Maktab natijalarini serverda qidirish, sahifalash va qisqa statistika.
import { listResults } from './result-service.mjs';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { listClasses } from './class-service.mjs';
import { fail } from '../lib/http.mjs';
const normalized = (value) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('uz');
export function queryResultRows(rows, params) {
  const search = normalized(params.get('search'));
  const testId = params.get('testId') || '';
  const classId = params.get('classId') || '';
  const sort = params.get('sort') || 'time';
  const name = (r) => `${r.surname || ''} ${r.name || ''}`;
  const selected = rows.filter(
    (r) =>
      (!testId || r.testId === testId) &&
      (!classId || r.classId === classId) &&
      normalized(name(r)).includes(search)
  );
  selected.sort((a, b) => {
    const order =
      sort === 'name'
        ? name(a).localeCompare(name(b), 'uz')
        : sort === 'score'
          ? (b.total ? b.score / b.total : 0) - (a.total ? a.score / a.total : 0)
          : String(b.time).localeCompare(String(a.time));
    return order || String(a.id).localeCompare(String(b.id));
  });
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
  }));
  return { items, total, page, pageSize, pages };
}
export async function pagedResults(params) {
  return queryResultRows(await listResults(), params);
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
