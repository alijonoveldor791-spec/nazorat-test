// Test kartasining xavfsiz markup, ixcham sanalari va ma'lumot ierarxiyasi.
import { listMode, selectionBox } from './test-list-controls.js';
import { esc } from '../core/dom.js';
import { cardTime as timeMarkup } from '../components/card-time.js';
import { empty } from '../components/empty-state.js';
import { action } from '../components/page-heading.js';
import { data } from './data.js';
import { codeCard, codeMenuActions } from './test-codes.js';
import { cardIcon } from '../components/card-icons.js';
const LABELS = { active: 'Faol', paused: "To'xtatilgan", scheduled: 'Jadvalda', ended: 'Yakunlangan' };
function menu(test) {
  const codeActions = codeMenuActions(test);
  return `<div class="test-card-top card-overlay-top">
    <span class="test-card-status ${esc(test.status)}">${LABELS[test.status] || esc(test.status)}</span>
    <details class="test-card-menu card-overlay-menu"><summary class="btn secondary test-card-more card-overlay-trigger" aria-label="Boshqa amallar" title="Boshqa amallar" aria-haspopup="dialog">${cardIcon('more')}</summary>
      <div class="test-card-menu-items card-overlay-items" role="dialog" aria-modal="false" aria-label="Boshqa amallar">
        ${action('assign-test', 'Sinf yoki guruh biriktirish', test.id, 'secondary')}
        ${action('edit-test', 'Tahrirlash', test.id, 'secondary')}
        ${action('duplicate-test', 'Nusxa olish', test.id, 'secondary')}
        ${action('export-test', 'Eksport', test.id, 'secondary')}
        ${codeActions}
        ${action('delete-test', "O'chirish", test.id, 'danger')}
      </div>
    </details></div>`;
}
function meta(test) {
  const rows = [
    ['clock', test.settings.timeLimitMin ? test.settings.timeLimitMin + ' daqiqa' : 'Vaqt cheklanmagan'],
    ['question', test.count + ' savol'],
    ['repeat', test.settings.maxAttempts + ' urinish'],
    ...(test.settings.shuffleQuestions ? [['shuffle', 'Aralashtiriladi']] : []),
  ];
  return `<div class="test-card-meta">${rows.map(([icon, text]) => `<span>${cardIcon(icon)}${esc(text)}</span>`).join('')}</div>`;
}
export function testCards(list) {
  if (!list.length) return empty('Test topilmadi', "Yangi test yuklang yoki qidiruvni o'zgartiring.");
  return `<div class="cards-grid ${listMode() === 'list' ? 'test-list-mode' : ''}">${list
    .map(
      (test) => `<article class="card test-card card-overlay-card" data-test-id="${esc(test.id)}">
    ${selectionBox(test)}
    ${menu(test)}
    <h2 class="test-card-title">${esc(test.title)}</h2>
    <div class="test-card-chips">
      ${audienceChips(test)}
    </div>
    ${meta(test)}
    <dl class="test-card-schedule"><div><dt>Boshlanish:</dt><dd>${timeMarkup(test.schedule.start)}</dd></div><div><dt>Tugash:</dt><dd>${timeMarkup(test.schedule.end)}</dd></div></dl>
    ${codeCard(test)}
    <footer class="test-card-footer">
      <p class="test-card-created">${test.createdAt ? "Qo'shilgan vaqt: " + timeMarkup(test.createdAt) : "Qo'shilgan vaqt noma'lum"}</p>
      <div class="test-card-actions">${action('edit-test', 'Tahrirlash', test.id, 'primary')}${action('toggle-test', test.active ? "To'xtatish" : 'Faollashtirish', test.id, 'secondary test-card-toggle')}</div>
    </footer>
  </article>`
    )
    .join('')}</div>`;
}

function audienceChips(test) {
  const classes = test.classIds.map(
    (id) => data.classes.find((c) => c.id === id) || { name: 'Eski sinf', kind: 'class' }
  );
  const names = (group) =>
    classes
      .filter((c) => (c.kind === 'group') === group)
      .map((c) => esc(c.name))
      .join(', ');
  return `${names(false) ? `<span class="test-card-chip">Fan: ${esc(test.subject || 'Belgilanmagan')}</span><span class="test-card-chip">Sinf: ${names(false)}</span>` : ''}
  ${names(true) ? `<span class="test-card-chip">Yo'nalish: ${esc(test.direction || '')}</span><span class="test-card-chip">Guruh: ${names(true)}</span>` : ''}
  <span class="test-card-chip">${test.testType === 'block' ? 'Blok test' : 'Oddiy test'}</span>`;
}
