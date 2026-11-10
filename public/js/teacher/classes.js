// teacher/classes.js: sahifaning shu vazifasi uchun modul.
import {
  listControls,
  clearSelection,
  chooseListMode,
  selectClasses,
  updateSelection,
  deleteSelectedClasses,
} from './class-list-controls.js';
import { $, esc } from '../core/dom.js';
import { empty } from '../components/empty-state.js';
import { toast } from '../components/toast.js';
import { confirmAction } from '../components/modal.js';

import { data, refresh } from './data.js';
import { call } from './teacher-api.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { showStudentCodes } from './student-codes.js';
import { editClass } from './class-editor.js';
import { classCards } from './class-card-view.js';
import { initCardMenus } from '../components/card-menu.js';
initCardMenus();
const filters = { query: '', kind: '', direction: '' };
export function classesView() {
  return (
    heading(
      'Sinflar',
      "Sinf ro'yxatlari va topshirish holatini boshqaring.",
      action('new-class', "+ Sinf yoki guruh qo'shish")
    ) +
    `<div class="toolbar">${filterFields()}</div><p id="class-filter-count" class="help">${visibleClasses().length} / ${data.classes.length} ta sinf yoki guruh</p><div id="class-list-controls">${listControls(visibleClasses())}</div><div id="class-items">${classItems()}</div>`
  );
}
bootstrapPage('classes', classesView, {
  'view-cards': () => {
    chooseListMode('cards');
    drawClasses();
  },
  'view-list': () => {
    chooseListMode('list');
    drawClasses();
  },
  'delete-selected-classes': () => deleteSelectedClasses(visibleClasses(), data.tests, drawClasses),
  'reset-class-filters': () => {
    $('class-search').value = '';
    $('class-kind-filter').value = '';
    $('class-direction-filter').value = '';
    filterClasses();
  },
  'edit-class': editClass,
  'student-codes': showStudentCodes,
  'delete-class': async (id) => {
    const related = data.tests.filter((t) => t.classIds.includes(id)).length;
    if (
      !(await confirmAction(
        "Sinf o'chirilsinmi?",
        related + ' ta test shu sinfga biriktirilgan. Sinf testlardan olinadi, eski natijalar saqlanadi.'
      ))
    )
      return;
    await call('classes/' + id, { method: 'DELETE' });
    await refresh();
    toast("Sinf o'chirildi.");
  },
});

function drawClasses() {
  if (!$('class-items')) return;
  $('class-list-controls').innerHTML = listControls(visibleClasses());
  $('class-items').innerHTML = classItems();
  $('class-filter-count').textContent =
    `${visibleClasses().length} / ${data.classes.length} ta sinf yoki guruh`;
  updateSelection(visibleClasses());
}
$('content')?.addEventListener('input', (event) => {
  if (event.target.id === 'class-search') filterClasses();
});
$('content')?.addEventListener('change', (event) => {
  if (['class-kind-filter', 'class-direction-filter'].includes(event.target.id)) filterClasses();
  if (event.target.id === 'select-all-classes' || event.target.matches('[data-select-class]')) {
    selectClasses(event, visibleClasses());
    updateSelection(visibleClasses());
  }
});
document.addEventListener('teacher:data', () => updateSelection(visibleClasses()));

function visibleClasses() {
  const query = filters.query.trim().toLocaleLowerCase('uz');
  return data.classes.filter(
    (c) =>
      (!filters.kind || (c.kind || 'class') === filters.kind) &&
      (!filters.direction || (c.kind === 'group' && c.direction === filters.direction)) &&
      c.name.toLocaleLowerCase('uz').includes(query)
  );
}
function classItems() {
  const classes = visibleClasses();
  return !classes.length && data.classes.length
    ? empty('Sinf yoki guruh topilmadi', "Qidiruvni yoki filtrlarni o'zgartiring.")
    : classCards(classes);
}
function filterClasses() {
  filters.query = $('class-search').value;
  filters.kind = $('class-kind-filter').value;
  filters.direction = filters.kind === 'class' ? '' : $('class-direction-filter').value;
  $('class-direction-filter').value = filters.direction;
  $('class-direction-filter').disabled = filters.kind === 'class';
  clearSelection();
  drawClasses();
}
function filterFields() {
  const directions = [
    ...new Set([
      ...data.classes
        .filter((c) => c.kind === 'group')
        .map((c) => c.direction)
        .filter(Boolean),
      ...(filters.direction ? [filters.direction] : []),
    ]),
  ].sort((a, b) => a.localeCompare(b, 'uz'));
  return `<input id="class-search" type="search" aria-label="Sinf yoki guruh qidirish" placeholder="Nom bo'yicha qidirish" value="${esc(filters.query)}">
  <select id="class-kind-filter" aria-label="Sinf yoki guruh turi"><option value="">Sinflar va guruhlar</option><option value="class" ${filters.kind === 'class' ? 'selected' : ''}>Faqat sinflar</option><option value="group" ${filters.kind === 'group' ? 'selected' : ''}>Faqat guruhlar</option></select>
  <select id="class-direction-filter" aria-label="Yo'nalish filtri" ${filters.kind === 'class' ? 'disabled' : ''}><option value="">Barcha yo'nalishlar</option>${directions.map((d) => `<option value="${esc(d)}" ${filters.direction === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
  <button class="btn secondary" data-action="reset-class-filters">Filtrlarni tozalash</button>`;
}
