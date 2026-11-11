// Server hisoblagan natija va ruxsat etilgan sharhlarni ko\'rsatadi.
import { sectionResultsMarkup } from '../components/section-results.js';
import { resultScore } from '../core/result-score.js';
import { $ } from '../core/dom.js';
import { initTheme } from '../core/theme.js';
import { mountStudentHeader } from '../components/student-header.js';
import { refreshResult } from './result-refresh.js';
import { loadResult } from './test-state.js';
import { renderContent } from '../core/content-renderer.js';
import { renderMath } from '../core/math-renderer.js';

mountStudentHeader();
initTheme();
const saved = await refreshResult(loadResult());
$('refresh-result').addEventListener('click', () => location.reload());
if (!saved) location.replace('/');
else if (saved.result.hidden === true) {
  $('hidden-result').hidden = false;
  if (saved.refreshFailed)
    $('hidden-result-note').textContent =
      "Natijani tekshirib bo'lmadi. Aloqani tekshiring va natijani yangilang.";
  document.querySelector('.result-hero').hidden = true;
  $('review').hidden = true;
} else {
  const { result, identity, title } = saved;
  const percent = Math.round((result.score / result.total) * 100);
  $('dt').textContent = title;
  $('score').textContent = resultScore(result);
  $('result-percent').textContent = percent + '%';
  const correct = result.results.filter(Boolean).length;
  $('result-correct').textContent = String(correct);
  $('result-wrong').textContent = String(result.total - correct);
  $('motivation').textContent =
    percent >= 86
      ? "Ajoyib natija! Shu sur'atda davom eting."
      : percent >= 60
        ? 'Yaxshi! Yana mashq qilsangiz, yanada yuqori natijaga erishasiz.'
        : 'Har bir urinish bilimni oshiradi. Mashq qilishda davom eting.';
  $('who').textContent = `${identity.surname} ${identity.name} · ${identity.grade}`;
  $('result-note').textContent = result.timedOut
    ? 'Vaqt tugadi. Serverga muddatida yetib borgan javoblar baholandi. Aloqa uzilganda yuborilmagan javoblar hisobga olinmadi.'
    : '';
  $('result-map').innerHTML = result.results
    .map(
      (ok, index) => `<span class="${ok ? '' : 'wrong'}"
    aria-label="${index + 1}-savol ${ok ? "to'g'ri" : "noto'g'ri"}">${index + 1} ${ok ? '✓' : '×'}</span>`
    )
    .join('');
  $('review').innerHTML = result.review
    ? `<div class="card">
<h2>Javoblarni tahlil qiling</h2>${result.review
        .map(
          (q, i) => `<div class="answer-detail">
<h3>${i + 1}. ${renderContent(q.q, q.contentFormat)}</h3>
<p>Sizning javobingiz: ${q.selected === null ? 'Javobsiz' : renderContent(q.options[q.selected], q.contentFormat)}</p>
<p>To\'g\'ri javob: ${renderContent(q.options[q.answer], q.contentFormat)}</p>
</div>`
        )
        .join('')}</div>`
    : '';
  $('result-map').insertAdjacentHTML(
    'beforebegin',
    sectionResultsMarkup(result.sections, result.dtmScore !== undefined ? 'dtm' : 'normal')
  );
  renderMath($('review'));
}

if (saved) $('done').classList.remove('hidden');

if (saved) $('done').hidden = false;
