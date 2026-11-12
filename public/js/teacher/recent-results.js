// So'nggi beshta test va barcha natijali testlarning qidiriladigan ro'yxati.
import { esc } from '../core/dom.js';
import { action } from '../components/page-heading.js';
import { overview } from './results-request.js';
import { modal } from '../components/modal.js';
export function recentResultsView() {
  return `<aside class="results-recent card"><div class="card-head"><h2>So'nggi testlar</h2>${action('refresh-recent', 'Yangilash', '', 'ghost small')}</div>
    <p class="help">Oxirgi topshirishlar bo'yicha</p>
    ${overview.error ? `<p class="error" role="alert">${esc(overview.error)}</p>` : ''}
    <div class="recent-list">${overview.recent.map(recentCard).join('') || '<p class="help">Hozircha testlar yo\'q.</p>'}</div>
    ${action('all-result-tests', "Barcha testlarni ko'rish", '', 'secondary all-tests')}</aside>`;
}
function recentCard(row) {
  return `<button type="button" class="recent-test" data-action="select-result-test" data-id="${esc(row.testId)}">
    <span class="recent-icon" aria-hidden="true">▤</span><span><strong>${esc(row.testTitle)}</strong>
    <small>${esc(row.grade)}</small><small>${row.count.toLocaleString('uz-UZ')} ta topshirish</small></span><span aria-hidden="true">›</span></button>`;
}
export function showResultTests() {
  const render = (search = '') =>
    overview.catalogue
      .filter((row) =>
        `${row.testTitle} ${row.grade}`.toLocaleLowerCase('uz').includes(search.toLocaleLowerCase('uz'))
      )
      .map(recentCard)
      .join('') || '<p class="help">Test topilmadi.</p>';
  modal(
    'Natijasi mavjud testlar',
    `<label>Testni qidirish<input id="result-test-search" type="search" placeholder="Test nomi yoki sinf..."></label>
    <div id="result-test-catalogue" class="recent-list">${render()}</div>`,
    { confirm: '', cancel: 'Yopish' }
  );
  document.getElementById('result-test-search').addEventListener('input', (event) => {
    document.getElementById('result-test-catalogue').innerHTML = render(event.target.value);
  });
  document.getElementById('result-test-search').focus();
}
