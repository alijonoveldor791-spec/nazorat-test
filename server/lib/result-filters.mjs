// Natija qidiruvi, topshirish holati va saralashni bir xil qoidalar bilan qo'llaydi.
import { norm } from './identity.mjs';
import { fail } from './http.mjs';

const STATUSES = new Set([
  'submitted',
  'completed',
  'with-violations',
  'terminated',
  'all',
  'not-submitted',
  'in-progress',
  'not-started',
]);
export const needsParticipation = (status) =>
  ['all', 'not-submitted', 'in-progress', 'not-started'].includes(status);
export function matchesStatus(row, status) {
  const submitted = row.hasResult !== false;
  if (status === 'all') return true;
  if (status === 'submitted') return submitted;
  if (status === 'completed') return submitted && !row.terminatedViolation && !(row.violationCount > 0);
  if (status === 'with-violations') return submitted && (row.violationCount > 0 || row.terminatedViolation);
  if (status === 'terminated') return submitted && row.terminatedViolation === true;
  if (status === 'not-submitted') return !submitted && !row.hasPreviousResult;
  return !submitted && row.submissionStatus === status;
}
export function filterResultRows(rows, params) {
  const status = params.get('status') || 'submitted';
  if (!STATUSES.has(status)) fail("Topshirish holati noto'g'ri.", 400);
  const testId = params.get('testId') || '';
  const classId = params.get('classId') || '';
  const words = norm(params.get('search')).split(' ').filter(Boolean);
  return rows.filter((row) => {
    const text = norm(`${row.surname || ''} ${row.name || ''} ${row.grade || ''} ${row.testTitle || ''}`);
    return (
      (!testId || row.testId === testId) &&
      (!classId || row.classId === classId) &&
      matchesStatus(row, status) &&
      words.every((word) => text.includes(word))
    );
  });
}
export function sortResultRows(rows, sort = 'time') {
  const name = (row) => `${row.surname || ''} ${row.name || ''}`;
  const ratio = (row) => (row.hasResult === false ? -1 : row.total ? row.score / row.total : 0);
  return rows.sort((a, b) => {
    const order =
      sort === 'name'
        ? name(a).localeCompare(name(b), 'uz')
        : sort === 'score'
          ? ratio(b) - ratio(a)
          : sort === 'score-asc'
            ? ratio(a) - ratio(b)
            : sort === 'time-asc'
              ? String(a.time || '').localeCompare(String(b.time || ''))
              : String(b.time || '').localeCompare(String(a.time || ''));
    return order || String(a.id).localeCompare(String(b.id));
  });
}
