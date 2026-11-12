// Natijalar sahifasining hodisalari, so'rovlari va eksport amallarini bog'laydi.
import { bootstrapPage } from './shell.js';
import { resultsView } from './results-view.js';
import { filters, requestResults, refreshOverview, collectResults } from './results-request.js';
import { showResultTests } from './recent-results.js';
import { exportRows } from './results-export.js';
import { resultDetail } from './result-detail.js';
import { downloadResultWord } from './result-word.js';
import { analysis } from './analytics.js';
import { call, post } from './teacher-api.js';
import { confirmAction } from '../components/modal.js';
import { rowsTable } from '../components/table.js';
import { toast } from '../components/toast.js';
let searchTimer,
  exporting = false;
document.body.classList.add('results-page');
async function refreshResults() {
  clearTimeout(searchTimer);
  await Promise.all([refreshOverview(), requestResults()]);
}
async function exportResults(kind) {
  if (exporting) return;
  exporting = true;
  const selection = { ...filters };
  toast('Eksport tayyorlanmoqda...');
  try {
    const rows = await collectResults(selection);
    if (kind === 'print') {
      document.getElementById('results-print')?.remove();
      const panel = document.createElement('section');
      panel.id = 'results-print';
      panel.innerHTML = '<h1>Natijalar</h1>' + rowsTable(rows, false);
      document.body.append(panel);
      window.addEventListener('afterprint', () => panel.remove(), { once: true });
      window.print();
    } else exportRows(rows, selection, kind === 'excel');
  } catch (error) {
    toast(error.message, true);
  } finally {
    exporting = false;
  }
}
bootstrapPage('results', resultsView, {
  refresh: refreshResults,
  'reload-results': requestResults,
  'refresh-recent': refreshOverview,
  'all-result-tests': showResultTests,
  'select-result-test': async (id) => {
    clearTimeout(searchTimer);
    filters.testId = id;
    filters.classId = '';
    filters.page = 1;
    document.querySelector('dialog[open]')?.close();
    await requestResults();
  },
  'result-page': async (page) => {
    clearTimeout(searchTimer);
    filters.page = Number(page);
    await requestResults();
  },
  'result-detail': resultDetail,
  'download-result-word': downloadResultWord,
  analysis: () => analysis(filters.testId),
  'delete-result': async (id) => {
    if (!(await confirmAction("Natija o'chirilsinmi?", "Ball va javoblar o'chiriladi."))) return;
    await call('results/' + id, { method: 'DELETE' });
    document.querySelector('dialog[open]')?.close();
    await refreshResults();
  },
  'allow-retake': async (id) => {
    await post('results/' + id + '/retake');
    toast('Qayta topshirishga ruxsat berildi.');
  },
  csv: () => exportResults('csv'),
  excel: () => exportResults('excel'),
  print: () => exportResults('print'),
}).then((ready) => {
  if (ready) refreshResults();
});
document.getElementById('content')?.addEventListener('input', (event) => {
  if (event.target.id !== 'result-search') return;
  filters.search = event.target.value;
  filters.page = 1;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(requestResults, 300);
});
document.getElementById('content')?.addEventListener('change', (event) => {
  const key = { 'result-test': 'testId', 'result-class': 'classId', 'result-sort': 'sort' }[event.target.id];
  if (!key) return;
  clearTimeout(searchTimer);
  filters[key] = event.target.value;
  filters.page = 1;
  requestResults();
});
