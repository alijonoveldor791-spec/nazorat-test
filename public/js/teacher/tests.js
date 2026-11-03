// teacher/tests.js: sahifaning shu vazifasi uchun modul.
import { $, esc } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { confirmAction } from '../components/modal.js';
import { empty } from '../components/empty-state.js';

import { download } from '../core/download.js';
import { data, refresh } from './data.js';
import { call, post } from './teacher-api.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { codeCard, codeActions } from './test-codes.js';
import { dateTime } from '../core/format.js';

export function testsView() {
  return (
    heading(
      'Testlar',
      'Savollarni tayyorlang, sinflarni biriktiring va vaqtni belgilang.',
      action('new-test', '+ Yangi test')
    ) +
    `<div class="toolbar">
<input id="test-search" type="search" aria-label="Test qidirish" placeholder="Test nomi bo\'yicha qidirish…">
<select id="test-status" aria-label="Holat filtri">
<option value="">Barcha holatlar</option>
<option value="active">Faol</option>
<option value="paused">To\'xtatilgan</option>
<option value="scheduled">Jadvalda</option>
<option value="ended">Yakunlangan</option>
</select>
<select id="test-sort" aria-label="Saralash"><option value="newest">Yangi qo'shilgan</option><option value="oldest">Eski qo'shilgan</option></select>
</div>
<div id="test-list">${testCards(data.tests)}</div>`
  );
}
export function testCards(list) {
  const labels = { active: 'Faol', paused: "To'xtatilgan", scheduled: 'Jadvalda', ended: 'Yakunlangan' };
  return list.length
    ? `<div class="cards-grid">${list
        .map(
          (t) => `<article class="card stack" data-test-id="${esc(t.id)}">
<div class="row between">
<span class="badge ${t.status === 'active' ? 'success' : 'neutral'}">● ${labels[t.status]}</span>
<span class="help">${t.count} savol</span>
</div>
<div>
<h2>${esc(t.title)}</h2>
<p>Fan: ${esc(t.subject || 'Belgilanmagan')}</p>
<p>Sinf: ${t.classIds.map((id) => esc(data.classes.find((c) => c.id === id)?.name || 'Eski sinf')).join(', ')}</p>
</div>
<p class="help">${t.settings.timeLimitMin ? t.settings.timeLimitMin + ' daqiqa' : 'Vaqt cheklanmagan'} · ${t.settings.maxAttempts} urinish${t.settings.shuffleQuestions ? ' · Aralashtiriladi' : ''}</p>
<p class="help">Boshlanish: ${t.schedule.start ? esc(dateTime(t.schedule.start)) : 'Belgilanmagan'}<br>Tugash: ${t.schedule.end ? esc(dateTime(t.schedule.end)) : 'Belgilanmagan'}</p>
${codeCard(t)}
<p class="help">Qo'shilgan vaqt: ${t.createdAt ? esc(dateTime(t.createdAt)) : 'Qo\'shilgan vaqt noma\'lum'}</p>
<div class="row card-actions">${action('edit-test', 'Tahrirlash', t.id, 'primary small')}${action('toggle-test', t.active ? "To'xtatish" : 'Faollashtirish', t.id, `${t.active ? 'warning' : 'success'} small`)}<details class="action-menu"><summary class="btn secondary small">⋯ Boshqa amallar</summary><div class="action-menu-items">${action('duplicate-test', 'Nusxa olish', t.id, 'secondary small')}${action('export-test', 'Eksport', t.id, 'secondary small')}${action('delete-test', "O'chirish", t.id, 'danger small')}</div></details></div>
</article>`
        )
        .join('')}</div>`
    : empty('Test topilmadi', "Yangi test yuklang yoki qidiruvni o'zgartiring.");
}
export function filterTests() {
  const q = $('test-search').value.toLowerCase(),
    status = $('test-status').value;
  const sort = $('test-sort')?.value || 'newest';
  $('test-list').innerHTML = testCards(data.tests
    .filter((t) => t.title.toLowerCase().includes(q) && (!status || t.status === status))
    .sort((a, b) => (sort === 'oldest' ? 1 : -1) * String(a.createdAt || '').localeCompare(String(b.createdAt || ''))));
}
bootstrapPage('tests', testsView, {
  ...codeActions,
  'edit-test': (id) => location.assign('/oqituvchi/test-tahrir.html?id=' + encodeURIComponent(id)),
  'delete-test': async (id) => {
    if (
      await confirmAction(
        "Test o'chirilsinmi?",
        'Eski natijalar saqlanadi. Boshlangan urinishlar yuborilmaydi.'
      )
    ) {
      await call('tests/' + id, { method: 'DELETE' });
      await refresh();
      toast("Test o'chirildi.");
    }
  },
  'toggle-test': async (id) => {
    await post('tests/' + id + '/toggle');
    await refresh();
    toast('Test holati yangilandi.');
  },
  'duplicate-test': async (id) => {
    await post('tests/' + id + '/duplicate');
    await refresh();
    toast('Test nusxasi yaratildi.');
  },
  'export-test': async (id) => {
    const t = await call('tests/' + id);
    download(
      'test-' + id + '.txt',
      t.questions
        .map(
          (q) =>
            q.q +
            '\n' +
            q.options.map((o, i) => 'ABCDEF'[i] + '. ' + o).join('\n') +
            '\nANSWER: ' +
            'ABCDEF'[q.answer]
        )
        .join('\n\n')
    );
    toast('Aiken fayli tayyor.');
  },
});
$('content')?.addEventListener('input', (event) => {
  if (event.target.id === 'test-search') filterTests();
});
$('content')?.addEventListener('change', (event) => {
  if (['test-status', 'test-sort'].includes(event.target.id)) filterTests();
});
