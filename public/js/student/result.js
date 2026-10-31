// Server hisoblagan natija va ruxsat etilgan sharhlarni ko’rsatadi.
import {$, esc} from '../core/dom.js';
import {initTheme} from '../core/theme.js';
import {mountStudentHeader} from '../components/student-header.js';
import {loadResult} from './test-state.js';

mountStudentHeader(); initTheme();
const saved = loadResult();
if (!saved) location.replace('/');
else {
  const {result, identity, title} = saved;
  const percent = Math.round(result.score / result.total * 100);
  $('dt').textContent = title;
  $('score').textContent = `${result.score} / ${result.total}`;
  $('result-percent').textContent = percent + '%';
  $('motivation').textContent = percent >= 86 ? 'Ajoyib natija! Shu sur’atda davom eting.' : percent >= 60 ? 'Yaxshi! Yana mashq qilsangiz, yanada yuqori natijaga erishasiz.' : 'Har bir urinish bilimni oshiradi. Mashq qilishda davom eting.';
  $('who').textContent = `${identity.surname} ${identity.name} · ${identity.grade}`;
  $('result-map').innerHTML = result.results.map((ok, index) => `<span class="${ok ? '' : 'wrong'}"
    aria-label="${index + 1}-savol ${ok ? 'to’g’ri' : 'noto’g’ri'}">${index + 1} ${ok ? '✓' : '×'}</span>`).join('');
  $('review').innerHTML = result.review ? `<div class="card"><h2>Javoblarni tahlil qiling</h2>${result.review.map((q, i) => `<div class="answer-detail"><h3>${i + 1}. ${esc(q.q)}</h3><p>Sizning javobingiz: ${esc(q.selected === null ? 'Javobsiz' : q.options[q.selected])}</p><p>To’g’ri javob: ${esc(q.options[q.answer])}</p></div>`).join('')}</div>` : '';
}

if (saved) $('done').classList.remove('hidden');

if (saved) $('done').hidden = false;
