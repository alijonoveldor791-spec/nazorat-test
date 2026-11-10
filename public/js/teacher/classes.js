// teacher/classes.js: sahifaning shu vazifasi uchun modul.
import {
  listControls,
  chooseListMode,
  selectClasses,
  updateSelection,
  deleteSelectedClasses,
} from './class-list-controls.js';
import { $ } from '../core/dom.js';
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
export function classesView() {
  return (
    heading(
      'Sinflar',
      "Sinf ro'yxatlari va topshirish holatini boshqaring.",
      action('new-class', "+ Sinf yoki guruh qo'shish")
    ) +
    `<div id="class-list-controls">${listControls(data.classes)}</div><div id="class-items">${classCards(data.classes)}</div>`
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
  'delete-selected-classes': () => deleteSelectedClasses(data.classes, data.tests, drawClasses),
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
  $('class-list-controls').innerHTML = listControls(data.classes);
  $('class-items').innerHTML = classCards(data.classes);
  updateSelection(data.classes);
}
$('content')?.addEventListener('change', (event) => {
  if (event.target.id === 'select-all-classes' || event.target.matches('[data-select-class]')) {
    selectClasses(event, data.classes);
    updateSelection(data.classes);
  }
});
document.addEventListener('teacher:data', () => updateSelection(data.classes));
