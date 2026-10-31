// teacher/classes.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { confirmAction } from '../components/modal.js';
import { empty } from '../components/empty-state.js';

import { data, refresh } from './data.js';
import { call } from './teacher-api.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { classProgress } from './class-progress.js';
import { showStudentCodes } from './student-codes.js';
import { editClass } from './class-editor.js';
export function classesView() {
  return (
    heading(
      'Sinflar',
      'Sinf ro’yxatlari va topshirish holatini boshqaring.',
      action('new-class', '+ Yangi sinf')
    ) +
    (data.classes.length
      ? `<div class="cards-grid">${data.classes
          .map((c) => {
            const tests = data.tests.filter((t) => t.classIds.includes(c.id));
            const progress = classProgress(c, tests, data.results);
            return `<article class="card stack">
<div class="row between">
<span class="avatar">${esc(c.name.slice(0, 2))}</span>
<span class="badge neutral">${c.students.length} o’quvchi</span>
</div>
<div>
<h2>${esc(c.name)}</h2>
<p>${tests.length} ta biriktirilgan test</p>
</div>
<p class="help">${tests.map((t) => esc(t.title)).join(', ') || 'Testlar hali biriktirilmagan.'}</p>${
              c.students.length
                ? `${progress.length ? progress.map((item) => `<details><summary>${esc(item.test.title)} · ${item.submitted}/${c.students.length} topshirgan</summary><p class="help">Topshirmaganlar: ${item.missing.map((student) => esc(student.surname + ' ' + student.name)).join(', ') || 'Hamma topshirgan.'}</p></details>`).join('') : '<p class="help">Hali test biriktirilmagan.</p>'}<div>${action('student-codes', 'Shaxsiy kirish kodlari', c.id, 'secondary')}</div>`
                : '<p class="help">Ochiq mashq rejimi: o’quvchi ismi tasdiqlanmaydi. Nazorat ishi uchun ro’yxat qo’shing.</p>'
            }<div class="row">${action('edit-class', 'Tahrirlash', c.id, 'secondary')}${action('delete-class', 'O’chirish', c.id, 'danger')}</div>
</article>`;
          })
          .join('')}</div>`
      : empty(
          'Birinchi sinfni yarating',
          'Masalan, 7-A yoki 8-B. O’quvchilar ro’yxatini keyin ham qo’shishingiz mumkin.'
        ))
  );
}
bootstrapPage('classes', classesView, {
  'edit-class': editClass,
  'student-codes': showStudentCodes,
  'delete-class': async (id) => {
    const related = data.tests.filter((t) => t.classIds.includes(id)).length;
    if (
      !(await confirmAction(
        'Sinf o’chirilsinmi?',
        related + ' ta test shu sinfga biriktirilgan. Sinf testlardan olinadi, eski natijalar saqlanadi.'
      ))
    )
      return;
    await call('classes/' + id, { method: 'DELETE' });
    await refresh();
    toast('Sinf o’chirildi.');
  },
});
