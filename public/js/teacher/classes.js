// teacher/classes.js: sahifaning shu vazifasi uchun modul.
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
      action('new-class', '+ Yangi sinf')
    ) + classCards(data.classes)
  );
}
bootstrapPage('classes', classesView, {
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
