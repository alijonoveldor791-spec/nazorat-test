// teacher/results.js: sahifaning shu vazifasi uchun modul.
import { blockExcelSheets, excelFilename } from './block-excel.js';
import { xlsxWorkbook, columnName } from '../core/xlsx-workbook.js';
import { formatScore } from '../core/result-score.js';
import { $, esc } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { confirmAction } from '../components/modal.js';

import { percent, dateTime } from '../core/format.js';
import { download } from '../core/download.js';
import { data } from './data.js';
import { resultRequest, requestResults } from './results-request.js';
import { recentResultsView, recentSelection, startRecent, refreshRecent } from './recent-results.js';
import { call, post } from './teacher-api.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { rowsTable } from '../components/table.js';
import { classChart } from '../components/class-chart.js';
import { downloadResultWord } from './result-word.js';
import { resultDetail } from './result-detail.js';
import { analysis } from './analytics.js';
let resultPage = 1;
const filters = { search: '', testId: '', classId: '', sort: 'time' };
export function filteredResults() {
  return data.results
    .filter(
      (r) =>
        (!filters.testId || r.testId === filters.testId) &&
        (!filters.classId || r.classId === filters.classId) &&
        `${r.surname} ${r.name}`.toLowerCase().includes(filters.search.toLowerCase())
    )
    .sort((a, b) =>
      filters.sort === 'score'
        ? percent(b) - percent(a)
        : filters.sort === 'name'
          ? (a.surname + a.name).localeCompare(b.surname + b.name, 'uz')
          : b.time.localeCompare(a.time)
    );
}
export function resultsView() {
  return (
    heading(
      'Natijalar',
      "O'sishni kuzating, savollarni tahlil qiling.",
      action('refresh', '↻ Yangilash', '', 'secondary') +
        action('analysis', 'Savollar tahlili', '', 'secondary')
    ) +
    recentResultsView() +
    `<div class="toolbar">
<input id="result-search" type="search" placeholder="O\'quvchini qidirish…" aria-label="O\'quvchi qidirish" value="${esc(filters.search)}">
<select id="result-test" aria-label="Test filtri">
<option value="">Barcha testlar</option>${[...new Map([...data.tests.map((t) => [t.id, t.title]), ...data.results.map((r) => [r.testId, r.testTitle])])].map(([id, title]) => `<option value="${esc(id)}" ${filters.testId === id ? 'selected' : ''}>${esc(title)}</option>`).join('')}</select>
<select id="result-class" aria-label="Sinf yoki guruh filtri">
<option value="">Barcha sinf va guruhlar</option>${data.classes.map((c) => `<option value="${esc(c.id)}" ${filters.classId === c.id ? 'selected' : ''}>${c.kind === 'group' ? 'Guruh: ' : 'Sinf: '}${esc(c.name)}</option>`).join('')}</select>
<select id="result-sort" aria-label="Saralash">
<option value="time">Eng yangi</option>
<option value="score" ${filters.sort === 'score' ? 'selected' : ''}>Yuqori ball</option>
<option value="name" ${filters.sort === 'name' ? 'selected' : ''}>Familiya bo\'yicha</option>
</select>
</div>
<div class="card">
<div class="card-head">
<h2>Topshirishlar ro\'yxati</h2>
<div class="row no-print">${action('csv', 'CSV', '', 'secondary small')}${action('excel', 'Excel (.xlsx)', '', 'secondary small')}${action('print', 'Chop etish', '', 'ghost small')}</div>
</div>
<div id="result-list">${resultList()}</div>
</div>
<div class="card">
<h2>Sinflar taqqoslash</h2>${classChart(filteredResults())}</div>`
  );
}
export function resultList() {
  if (!resultRequest.ready) return `<p class="help" role="status">${esc(resultRequest.message)}</p>`;
  const rows = filteredResults(),
    pages = Math.max(1, Math.ceil(rows.length / 20));
  resultPage = Math.min(resultPage, pages);
  return (
    rowsTable(rows.slice((resultPage - 1) * 20, resultPage * 20)) +
    `<div class="spacing-1 row between no-print">
<p class="help">${rows.length} natija · ${resultPage} / ${pages} sahifa</p>
<div class="row">${action('prev-page', '← Oldingi', '', 'secondary')}${action('next-page', 'Keyingi →', '', 'secondary')}</div>
</div>`
  );
}
export function exportRows(excel = false) {
  if (!resultRequest.ready) return toast('Avval natijalarni yuklang.', true);
  const selected = filteredResults();
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
bootstrapPage('results', resultsView, {
  refresh: () => requestResults(filters, true),
  'recent-results': async (index) => {
    const row = recentSelection(index);
    if (!row) return;
    filters.testId = row.testId;
    filters.classId = row.classId;
    resultPage = 1;
    await requestResults(filters);
  },
  'result-detail': resultDetail,
  'download-result-word': downloadResultWord,
  analysis: () => analysis(filters.testId),
  'delete-result': async (id) => {
    if (
      await confirmAction(
        "Natija o'chirilsinmi?",
        "Ball va javoblar o'chirilib, bu topshirish qayta ko'rinmaydi."
      )
    ) {
      await call('results/' + id, { method: 'DELETE' });
      document.querySelector('dialog[open]')?.close();
      await requestResults(filters, true);
      await refreshRecent();
      toast("Natija o'chirildi.");
    }
  },
  'allow-retake': async (id) => {
    await post('results/' + id + '/retake');
    toast('Yana bir urinishga ruxsat berildi.');
  },
  'prev-page': () => {
    resultPage = Math.max(1, resultPage - 1);
    $('result-list').innerHTML = resultList();
  },
  'next-page': () => {
    resultPage++;
    $('result-list').innerHTML = resultList();
  },
  csv: () => exportRows(),
  excel: () => exportRows(true),
  print: () => window.print(),
}).then((ready) => {
  if (ready) startRecent();
});
$('content')?.addEventListener('input', (event) => {
  if (event.target.id === 'result-search') {
    filters.search = event.target.value;
    resultPage = 1;
    $('result-list').innerHTML = resultList();
  }
});
$('content')?.addEventListener('change', (event) => {
  const id = event.target.id;
  if (['result-test', 'result-class', 'result-sort'].includes(id)) {
    filters[{ 'result-test': 'testId', 'result-class': 'classId', 'result-sort': 'sort' }[id]] =
      event.target.value;
    resultPage = 1;
    if (id !== 'result-sort') requestResults(filters);
    else $('result-list').innerHTML = resultList();
  }
});
