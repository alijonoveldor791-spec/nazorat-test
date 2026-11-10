// teacher/tests.js: sahifaning shu vazifasi uchun modul.
import { assignTest } from './test-assignment.js';
import { $ } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { confirmAction } from '../components/modal.js';

import { download } from '../core/download.js';
import { data, refresh } from './data.js';
import { call, post } from './teacher-api.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { codeActions } from './test-codes.js';
import { testCards } from './test-card-view.js';
import { initCardMenus } from '../components/card-menu.js';
initCardMenus();
let selectedAudience = 'all';

export function testsView() {
  return (
    heading(
      'Testlar',
      'Savollarni tayyorlang, sinflarni biriktiring va vaqtni belgilang.',
      action('new-test', '+ Yangi test')
    ) +
    `<div class="toolbar">
<input id="test-search" type="search" aria-label="Test qidirish" placeholder="Test nomi bo\'yicha qidirish…">
<div class="row" aria-label="Test auditoriyasi">${[
      ['class', 'Sinflar uchun testlar'],
      ['group', 'Guruhlar uchun testlar'],
      ['all', 'Barcha testlar'],
    ]
      .map(
        ([value, label]) =>
          `<button class="btn secondary" data-action="audience-${value}" aria-pressed="${selectedAudience === value}">${label}</button>`
      )
      .join('')}</div>
<select id="test-status" aria-label="Holat filtri">
<option value="">Barcha holatlar</option>
<option value="active">Faol</option>
<option value="paused">To\'xtatilgan</option>
<option value="scheduled">Jadvalda</option>
<option value="ended">Yakunlangan</option>
</select>
<select id="test-sort" aria-label="Saralash"><option value="newest">Yangi qo'shilgan</option><option value="oldest">Eski qo'shilgan</option></select>
</div>
<div id="test-list">${testCards(data.tests.filter(audienceMatches))}</div>`
  );
}
export function filterTests() {
  const q = $('test-search').value.toLowerCase(),
    status = $('test-status').value;
  const sort = $('test-sort')?.value || 'newest';
  $('test-list').innerHTML = testCards(
    data.tests
      .filter(audienceMatches)
      .filter((t) => t.title.toLowerCase().includes(q) && (!status || t.status === status))
      .sort(
        (a, b) =>
          (sort === 'oldest' ? 1 : -1) * String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
      )
  );
}
bootstrapPage('tests', testsView, {
  ...codeActions,
  'audience-class': () => chooseAudience('class'),
  'audience-group': () => chooseAudience('group'),
  'audience-all': () => chooseAudience('all'),
  'assign-test': assignTest,
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
    if (t.questions.some((question) => question.contentFormat === 'rich-html-v1'))
      throw new Error(
        "Word formatidagi rasm, jadval va formulalarni Aiken .txt fayliga yo'qotishsiz o'tkazib bo'lmaydi."
      );
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

function chooseAudience(value) {
  selectedAudience = value;
  document
    .querySelectorAll('[data-action^="audience-"]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.action === 'audience-' + value))
    );
  filterTests();
}

function audienceMatches(test) {
  return (
    selectedAudience === 'all' ||
    test.classIds.some((id) => (data.classes.find((c) => c.id === id)?.kind || 'class') === selectedAudience)
  );
}
