// teacher/result-detail.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { promptHtml, optionHtml } from '../components/rich-content.js';

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
<div>${i + 1}. ${promptHtml(q)}</div>
<div>Sizning javobingiz: ${r.answers[i] === null ? 'Javobsiz' : optionHtml(q, r.answers[i])}</div>
<div>To\'g\'ri javob: ${optionHtml(q, q.answer)} ${r.answers[i] === q.answer ? '✓' : '×'}</div>
</div>`
          )
          .join('')
      : empty('Batafsil javoblar saqlanmagan', "Eski natija: ball va foiz to'liq ko'rsatilgan.")
  }<hr>
<div class="row">${action('allow-retake', 'Qayta topshirishga ruxsat', id, 'secondary')}${action('delete-result', "Natijani o'chirish", id, 'danger')}</div>`;
  modal('Natija tafsiloti', html, { confirm: '', cancel: 'Yopish' });
}
