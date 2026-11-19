// Test natijalari uchun Excel va CSV hisobotlarini tayyorlaydi.
import { xlsxWorkbook, columnName } from './xlsx-workbook.js';
import { downloadBlob, formatDateTime, formatScore, percent } from './format.js';
import { statusLabel } from './result-status.js';
const sectionKey = (s) => `${s.type} / ${s.subject}`;
const fullName = (r) => [r.surname, r.name].filter(Boolean).join(' ');
const norm = (t) => t.trim().toLowerCase().replace(/\s+/g, ' ');
const totalScore = (r) => r.dtmScore ?? r.score;
function blockSheet(rows, test, cls, search, includeAbsent) {
  const sections = Array.from(
    new Map(rows.flatMap((row) => (row.sections || []).map((s) => [sectionKey(s), s]))).values()
  );
  const priority = (s) => (/^1\s*-/.test(s.type) ? 0 : /^2\s*-/.test(s.type) ? 1 : 2);
  sections.sort((a, b) => priority(a) - priority(b));
  const last = columnName(sections.length + 2);
  const title = cls?.name || rows[0]?.grade || 'Natijalar';
  const output = [
    [title, ...Array(sections.length + 2).fill('')],
    [
      'No',
      'Familiya ism',
      ...sections.map((s) => (priority(s) === 2 ? s.subject.toUpperCase() : s.subject)),
      'Jami ball',
    ],
  ];
  const sorted = [...rows].sort(
    (a, b) =>
      totalScore(b) - totalScore(a) ||
      fullName(a).localeCompare(fullName(b), 'uz') ||
      b.time.localeCompare(a.time)
  );
  for (const [index, row] of sorted.entries()) {
    output.push([
      index + 1,
      fullName(row),
      ...sections.map((section) => {
        const found = row.sections?.find((s) => sectionKey(s) === sectionKey(section));
        if (!found) return '-';
        return found.correctCount ?? (row.dtmScore === undefined ? found.score : '-');
      }),
      { value: totalScore(row), style: 3 },
    ]);
  }
  const merges = [`A1:${last}1`];
  const participated = new Set(rows.map((r) => r.studentId).filter(Boolean));
  const names = new Set(rows.map((r) => norm(fullName(r))));
  for (const student of includeAbsent ? cls?.students || [] : []) {
    if (
      participated.has(student.id) ||
      names.has(norm(fullName(student))) ||
      !norm(fullName(student)).includes(norm(search))
    )
      continue;
    output.push([output.length - 1, fullName(student), 'Qatnashmadi', ...Array(sections.length).fill('')]);
    merges.push(`C${output.length}:${last}${output.length}`);
  }
  return {
    name: `${title} - ${test?.title || rows[0]?.testTitle || 'Blok'}`,
    rows: output,
    merges,
    widths: [6, 34, ...sections.map(() => 17), 16],
  };
}
export function exportResultsFile(selected, tests, classes, filters, excel) {
  const sectionColumns = Array.from(
    new Set(selected.flatMap((r) => (r.sections || []).map((s) => sectionKey(s))))
  );
  const rows = [
    [
      ...(excel ? ['No'] : []),
      ...(excel ? ['Familiya ism'] : ['Familiya', 'Ism']),
      'Sinf',
      'Test',
      'Holat',
      "To'g'ri javoblar",
      'Savollar',
      'Foiz',
      'Vaqt',
      'Baholash',
      'Jami ball',
      'Maksimal ball',
      ...sectionColumns,
    ],
    ...selected.map((r, index) => [
      ...(excel ? [index + 1] : []),
      ...(excel ? [fullName(r)] : [r.surname, r.name]),
      r.grade,
      r.testTitle,
      statusLabel(r),
      r.score,
      r.total,
      r.hasResult === false ? '—' : percent(r) + '%',
      r.time ? formatDateTime(r.time) : '—',
      r.hasResult === false ? '—' : r.scoringMode === 'dtm' ? 'DTM' : 'Oddiy',
      r.hasResult === false ? '—' : formatScore(r.dtmScore ?? r.score),
      r.maxScore ?? r.total,
      ...sectionColumns.map((label) => {
        const section = r.sections?.find((s) => sectionKey(s) === label);
        return section
          ? `${formatScore(section.score)}/${formatScore(section.maxScore ?? section.total)}`
          : '';
      }),
    ]),
  ];
  const safeCsv = (v) => (/^[=+@\-\t\r]/.test(String(v)) ? "'" + v : String(v ?? ''));
  if (excel) {
    const participationExport = selected.some((row) => row.hasResult === false);
    const groups = new Map();
    const ordinary = [];
    for (const row of selected) {
      const test = tests.find((t) => t.id === row.testId);
      if (participationExport || (test?.testType !== 'block' && !row.sections?.length)) {
        ordinary.push(row);
        continue;
      }
      const key = JSON.stringify([row.testId, row.classId]);
      const list = groups.get(key) || [];
      list.push(row);
      groups.set(key, list);
    }
    const sheets = Array.from(groups.values()).map((group) =>
      blockSheet(
        group,
        tests.find((t) => t.id === group[0].testId),
        classes.find((c) => c.id === group[0].classId),
        filters.search,
        !filters.status
      )
    );
    if (ordinary.length || !sheets.length) {
      const ordinaryIds = new Set(ordinary.map((r) => r.id));
      const genericRows = rows
        .filter((_, idx) => idx === 0 || ordinaryIds.has(selected[idx - 1].id))
        .map((row, idx) => (idx === 0 ? row : [idx, ...row.slice(1)]));
      const count = rows[0].length;
      sheets.push({
        name: 'Umumiy natijalar',
        rows: [['Natijalar', ...Array(count - 1).fill('')], ...genericRows],
        widths: [6, 34, ...Array(count - 2).fill(22)],
        merges: [`A1:${columnName(count - 1)}1`],
      });
    }
    const ids = new Set(selected.map((r) => r.classId || r.grade));
    let fname = 'natijalar';
    if (ids.size === 1 || (!selected.length && filters.classId)) {
      const id = selected[0]?.classId || filters.classId;
      fname = classes.find((c) => c.id === id)?.name || selected[0]?.grade || fname;
    } else if (ids.size > 1) {
      fname = 'guruhlar-natijalari';
    }
    fname =
      fname
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
        .trim()
        .slice(0, 100) || 'natijalar';
    const blobData = xlsxWorkbook(sheets);
    downloadBlob(
      fname + '.xlsx',
      new Uint8Array(blobData).buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  } else {
    const csv =
      '\ufeff' +
      rows.map((row) => row.map((c) => `"${safeCsv(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    downloadBlob('natijalar.csv', csv, 'text/csv;charset=utf-8');
  }
}
