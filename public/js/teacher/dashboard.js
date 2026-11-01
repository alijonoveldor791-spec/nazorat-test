// teacher/dashboard.js: sahifaning shu vazifasi uchun modul.

import { percent } from '../core/format.js';

import { data } from './data.js';

import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { rowsTable } from '../components/table.js';
import { classChart } from '../components/class-chart.js';
export function dashboard() {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
  const today = data.results.filter(
    (r) => new Date(r.time).toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' }) === date
  ).length;
  const avg = data.results.length
    ? Math.round(data.results.reduce((s, r) => s + percent(r), 0) / data.results.length)
    : 0;
  return (
    heading(
      'Bugungi manzara',
      "O'quvchilaringiz yutuqlarini bir qarashda kuzating.",
      action('new-test', '+ Yangi test') + action('new-class', '+ Yangi sinf', '', 'secondary')
    ) +
    `<div class="stat-grid">${[
      [today, 'Bugungi topshirishlar', '↗'],
      [data.tests.filter((t) => t.status === 'active').length, 'Faol testlar', '▤'],
      [data.classes.length, 'Sinflar', '♧'],
      [avg + '%', "O'rtacha natija", '▥'],
    ]
      .map(
        ([v, l, i]) =>
          `<div class="card metric">
<span class="badge">${i}</span>
<p>${l}</p>
<strong>${v}</strong>
</div>`
      )
      .join('')}</div>
<div class="two-col">
<section class="card">
<div class="card-head">
<h2>Oxirgi natijalar</h2>${action('show-results', "Barchasini ko'rish →", '', 'ghost small')}</div>${rowsTable(data.results.slice(0, 10))}</section>
<section class="card">
<div class="card-head">
<h2>Sinflar bo\'yicha natija</h2>
<span class="badge">%</span>
</div>${classChart(data.results)}<hr>
<h3>Kichik qadam, katta natija</h3>
<p>Testni sinfga biriktiring. O\'quvchilar natijalarini tahlil qilib, keyingi darsni rejalashtiring.</p>
</section>
</div>`
  );
}
bootstrapPage('dashboard', dashboard);
