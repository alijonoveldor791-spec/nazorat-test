// teacher/result-detail.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';

import { modal } from '../components/modal.js';
import { empty } from '../components/empty-state.js';

import { percent } from '../core/format.js';

import { call } from './teacher-api.js';
import { action } from '../components/page-heading.js';
export async function resultDetail(id) {
  const r = await call('results/' + id);
  const html = `<p>${esc(r.surname + ' ' + r.name)} · ${esc(r.grade)} · ${r.score}/${r.total} (${percent(r)}%)</p>
${r.timedOut ? '<p>Vaqt tugagach serverdagi oxirgi javoblar yakunlangan.</p>' : ''}
<p>Sarflangan vaqt: ${r.durationSec === null ? 'Eski yozuvda saqlanmagan' : r.durationSec + ' soniya'}</p>${
    r.questions?.length
      ? r.questions
          .map(
            (q, i) => `<div class="answer-detail">
<h3>${i + 1}. ${esc(q.q)}</h3>
<p>Sizning javobingiz: ${esc(r.answers[i] === null ? 'Javobsiz' : q.options[r.answers[i]])}</p>
<p>To’g’ri javob: ${esc(q.options[q.answer])} ${r.answers[i] === q.answer ? '✓' : '×'}</p>
</div>`
          )
          .join('')
      : empty('Batafsil javoblar saqlanmagan', 'Eski natija: ball va foiz to’liq ko’rsatilgan.')
  }<hr>
<div class="row">${action('allow-retake', 'Qayta topshirishga ruxsat', id, 'secondary')}${action('delete-result', 'Natijani o’chirish', id, 'danger')}</div>`;
  modal('Natija tafsiloti', html, { confirm: '', cancel: 'Yopish' });
}
