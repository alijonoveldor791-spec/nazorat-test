// Sinf kartalari: o'quvchilar, biriktirilgan testlar va avvalgi progress tafsiloti.
import { esc } from '../core/dom.js';
import { action } from '../components/page-heading.js';
import { empty } from '../components/empty-state.js';
import { cardIcon } from '../components/card-icons.js';
import { cardTime } from '../components/card-time.js';
import { data } from './data.js';
import { classProgress } from './class-progress.js';
function progressMarkup(cls, tests) {
  if (!cls.students.length)
    return `<p class="class-card-note">Ochiq mashq rejimi: o'quvchi ismi tasdiqlanmaydi. Nazorat ishi uchun ro'yxat qo'shing.</p>`;
  const progress = classProgress(cls, tests, data.results);
  if (!progress.length) return '<p class="class-card-note">Hali test biriktirilmagan.</p>';
  return `<div class="class-card-progress">${progress
    .map(
      (item) => `<details>
    <summary>${esc(item.test.title)} · ${item.submitted}/${cls.students.length} topshirgan</summary>
    <p class="help">Topshirmaganlar: ${item.missing.map((student) => esc(student.surname + ' ' + student.name)).join(', ') || 'Hamma topshirgan.'}</p>
  </details>`
    )
    .join('')}</div>`;
}
function menu(cls) {
  return `<details class="card-overlay-menu"><summary class="btn secondary card-overlay-trigger" aria-label="Boshqa amallar" title="Boshqa amallar" aria-haspopup="dialog">${cardIcon('more')}</summary>
    <div class="card-overlay-items" role="dialog" aria-modal="false" aria-label="Boshqa amallar">
      ${action('edit-class', 'Tahrirlash', cls.id, 'secondary')}
      ${cls.students.length ? action('student-codes', 'Shaxsiy kirish kodlari', cls.id, 'secondary') : ''}
      ${action('delete-class', "O'chirish", cls.id, 'danger')}
    </div>
  </details>`;
}
export function classCards(list) {
  if (!list.length)
    return empty(
      'Birinchi sinfni yarating',
      "Masalan, 7-A yoki 8-B. O'quvchilar ro'yxatini keyin ham qo'shishingiz mumkin."
    );
  return `<div id="class-list" class="cards-grid">${list
    .map((cls) => {
      const tests = data.tests.filter((test) => test.classIds.includes(cls.id));
      return `<article class="card class-card card-overlay-card" data-class-id="${esc(cls.id)}">
      <div class="class-card-top card-overlay-top"><span class="avatar">${esc(cls.name.slice(0, 2))}</span>${menu(cls)}</div>
      <h2 class="class-card-title">${esc(cls.name)}</h2>
      <div class="class-card-meta"><span>${cardIcon('repeat')}${cls.students.length} o'quvchi</span><span>${cardIcon('question')}${tests.length} ta biriktirilgan test</span></div>
      <div class="class-card-tests">${tests.length ? tests.map((test) => `<span class="class-card-chip">${esc(test.title)}</span>`).join('') : '<p class="help">Testlar hali biriktirilmagan.</p>'}</div>
      ${progressMarkup(cls, tests)}
      <footer class="class-card-footer"><p class="class-card-created">${cls.createdAt ? "Qo'shilgan vaqt: " + cardTime(cls.createdAt) : "Qo'shilgan vaqt noma'lum"}</p>${action('edit-class', 'Tahrirlash', cls.id, 'primary')}</footer>
    </article>`;
    })
    .join('')}</div>`;
}
