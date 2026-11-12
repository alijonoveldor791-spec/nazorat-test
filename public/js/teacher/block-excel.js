// Blok natijalarini test/sinf bo'yicha reyting va fan ustunli varaqlarga ajratadi.
import { columnName } from '../core/xlsx-workbook.js';
const sectionKey = (section) => section.type + ' / ' + section.subject;
const fullName = (row) => [row.surname, row.name].filter(Boolean).join(' ');
const normalized = (text) => String(text).trim().toLowerCase().replace(/\s+/g, ' ');
const totalScore = (row) => row.dtmScore ?? row.score;
function blockSheet(rows, test, cls, search) {
  const sections = [
    ...new Map(
      rows.flatMap((row) => (row.sections || []).map((section) => [sectionKey(section), section]))
    ).values(),
  ];
  const priority = (s) => (/^1\s*-/.test(s.type) ? 0 : /^2\s*-/.test(s.type) ? 1 : 2);
  sections.sort((a, b) => priority(a) - priority(b));
  const last = columnName(sections.length + 2);
  const title = cls?.name || rows[0]?.grade || 'Natijalar';
  const output = [
    [title, ...Array(sections.length + 2).fill('')],
    [
      'No',
      'Familiya ism',
      ...sections.map((section) =>
        priority(section) === 2 ? section.subject.toUpperCase() : section.subject
      ),
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
  const merges = ['A1:' + last + '1'];
  const participated = new Set(rows.map((row) => row.studentId).filter(Boolean));
  const names = new Set(rows.map((row) => normalized(fullName(row))));
  for (const student of cls?.students || []) {
    if (
      participated.has(student.id) ||
      names.has(normalized(fullName(student))) ||
      !normalized(fullName(student)).includes(normalized(search))
    )
      continue;
    const number = output.length - 1;
    output.push([number, fullName(student), 'Qatnashmadi', ...Array(sections.length).fill('')]);
    merges.push('C' + output.length + ':' + last + output.length);
  }
  return {
    name:
      (cls?.name || rows[0]?.grade || 'Natijalar') + ' - ' + (test?.title || rows[0]?.testTitle || 'Blok'),
    rows: output,
    merges,
    widths: [6, 34, ...sections.map(() => 17), 16],
  };
}
export function blockExcelSheets(rows, tests, classes, search = '') {
  const groups = new Map(),
    ordinary = [];
  for (const row of rows) {
    const test = tests.find((item) => item.id === row.testId);
    if (test?.testType !== 'block' && !row.sections?.length) {
      ordinary.push(row);
      continue;
    }
    const key = JSON.stringify([row.testId, row.classId]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return {
    sheets: [...groups.values()].map((group) =>
      blockSheet(
        group,
        tests.find((t) => t.id === group[0].testId),
        classes.find((c) => c.id === group[0].classId),
        search
      )
    ),
    ordinary,
  };
}

export function excelFilename(rows, classes, classId = '') {
  const ids = new Set(rows.map((row) => row.classId || row.grade));
  let name = 'natijalar';
  if (ids.size === 1 || (!rows.length && classId)) {
    const id = rows[0]?.classId || classId;
    name = classes.find((cls) => cls.id === id)?.name || rows[0]?.grade || name;
  } else if (ids.size > 1) name = 'guruhlar-natijalari';
  name =
    name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
      .replace(/[. ]+$/g, '')
      .trim()
      .slice(0, 100) || 'natijalar';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) name += '-natijalar';
  return name + '.xlsx';
}
