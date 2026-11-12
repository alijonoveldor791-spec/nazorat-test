// Filtrlangan natijalarni mavjud CSV va Excel formatlarida yuklab beradi.
import { blockExcelSheets, excelFilename } from './block-excel.js';
import { xlsxWorkbook, columnName } from '../core/xlsx-workbook.js';
import { formatScore } from '../core/result-score.js';
import { percent, dateTime } from '../core/format.js';
import { download } from '../core/download.js';
import { data } from './data.js';
import { toast } from '../components/toast.js';
export function exportRows(selected, filters, excel = false) {
  const sectionColumns = [
    ...new Set(selected.flatMap((r) => (r.sections || []).map((s) => s.type + ' / ' + s.subject))),
  ];
  const rows = [
    [
      ...(excel ? ['Familiya ism'] : ['Familiya', 'Ism']),
      'Sinf',
      'Test',
      "To'g'ri javoblar",
      'Savollar',
      'Foiz',
      'Vaqt',
      'Baholash',
      'Jami ball',
      'Maksimal ball',
      ...sectionColumns,
    ],
    ...selected.map((r) => [
      ...(excel ? [[r.surname, r.name].filter(Boolean).join(' ')] : [r.surname, r.name]),
      r.grade,
      r.testTitle,
      r.score,
      r.total,
      percent(r) + '%',
      dateTime(r.time),
      r.scoringMode === 'dtm' ? 'DTM' : 'Oddiy',
      formatScore(r.dtmScore ?? r.score),
      r.maxScore ?? r.total,
      ...sectionColumns.map((label) => {
        const section = r.sections?.find((s) => s.type + ' / ' + s.subject === label);
        return section
          ? formatScore(section.score) + '/' + formatScore(section.maxScore ?? section.total)
          : '';
      }),
    ]),
  ];
  const safe = (value) => (/^[=+@\-\t\r]/.test(String(value)) ? "'" + value : String(value ?? ''));
  if (excel) {
    const { sheets, ordinary } = blockExcelSheets(selected, data.tests, data.classes, filters.search);
    if (ordinary.length || !sheets.length) {
      const ordinaryIds = new Set(ordinary.map((row) => row.id));
      const genericRows = rows.filter((_, index) => index === 0 || ordinaryIds.has(selected[index - 1].id));
      const count = rows[0].length;
      sheets.push({
        name: 'Umumiy natijalar',
        rows: [['Natijalar', ...Array(count - 1).fill('')], ...genericRows],
        widths: [34, ...Array(count - 1).fill(22)],
        merges: ['A1:' + columnName(count - 1) + '1'],
      });
    }
    download(
      excelFilename(selected, data.classes, filters.classId),
      xlsxWorkbook(sheets),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  } else
    download(
      'natijalar.csv',
      '\ufeff' +
        rows.map((row) => row.map((c) => '"' + safe(c).replace(/"/g, '""') + '"').join(',')).join('\r\n'),
      'text/csv;charset=utf-8'
    );
  toast('Eksport tayyor.');
}
