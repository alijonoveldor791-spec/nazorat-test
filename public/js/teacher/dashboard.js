// Maktab bosh sahifasining haqiqiy ko'rsatkichlari, so'nggi natijalari va amallari.
import { percent } from '../core/format.js';
import { data, refresh } from './data.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { rowsTable } from '../components/table.js';
import { classChart } from '../components/class-chart.js';
import { resultDetail } from './result-detail.js';
import { downloadResultWord } from './result-word.js';
import { call, post } from './teacher-api.js';
import { confirmAction } from '../components/modal.js';
import { toast } from '../components/toast.js';
document.body.classList.add('dashboard-page');
export function dashboard() {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
  const today = data.results.filter(
    (r) => new Date(r.time).toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' }) === date
  ).length;
  const avg = data.results.length
    ? Math.round(data.results.reduce((sum, row) => sum + percent(row), 0) / data.results.length)
    : null;
  const recent = [...data.results].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);
  return (
    heading(
      'Bosh sahifa',
      "Maktabingizdagi testlar va o'quvchilar natijalari.",
      action('new-test', '+ Yangi test') + action('new-class', "+ Sinf yoki guruh qo'shish", '', 'secondary')
    ) +
    `<div class="stat-grid dashboard-stats">${[
      [today, 'Bugungi topshirishlar', '↗'],
      [data.tests.filter((test) => test.status === 'active').length, 'Faol testlar', '▤'],
      [data.classes.length, 'Sinflar va guruhlar', '♧'],
      [avg === null ? '—' : avg + '%', "O'rtacha natija", '◴'],
    ]
      .map(
        ([value, label, icon]) =>
          `<article class="card metric"><div class="metric-top"><span class="metric-icon" aria-hidden="true">${icon}</span><span>${label}</span></div><strong>${value}</strong><p class="help">${label === 'Bugungi topshirishlar' ? "Toshkent vaqti bo'yicha" : label === "O'rtacha natija" ? "Barcha topshirishlar bo'yicha" : "Joriy maktab bo'yicha"}</p></article>`
      )
      .join('')}</div>
    <div class="dashboard-panels"><section class="card dashboard-recent"><div class="card-head"><div><h2>Oxirgi natijalar</h2><p class="help">Eng so'nggi 5 ta topshirish</p></div>${action('show-results', "Barchasini ko'rish →", '', 'ghost small')}</div>${rowsTable(recent)}</section>
    <section class="card dashboard-chart"><div class="card-head"><h2>Sinflar bo'yicha o'rtacha foiz</h2><span class="badge">%</span></div>${classChart(data.results)}<p class="help">Har bir sinf yoki guruhning topshirishlari asosida hisoblanadi.</p></section></div>`
  );
}
bootstrapPage('dashboard', dashboard, {
  'result-detail': resultDetail,
  'download-result-word': downloadResultWord,
  'allow-retake': async (id) => {
    await post('results/' + id + '/retake');
    toast('Qayta topshirishga ruxsat berildi.');
  },
  'delete-result': async (id) => {
    if (!(await confirmAction("Natija o'chirilsinmi?", "Ball va javoblar o'chiriladi."))) return;
    await call('results/' + id, { method: 'DELETE' });
    document.querySelector('dialog[open]')?.close();
    await refresh('dashboard');
    toast("Natija o'chirildi.");
  },
});
