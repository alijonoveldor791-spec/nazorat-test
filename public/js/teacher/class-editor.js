// teacher/class-editor.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

import { data, refresh } from './data.js';
import { post } from './teacher-api.js';

export async function editClass(id) {
  const c = data.classes.find((c) => c.id === id) || { name: '', students: [] };
  const dialog = await modal(
    id ? 'Sinfni tahrirlash' : 'Yangi sinf',
    `<form class="stack">
<label>Sinf nomi<input id="class-name" required maxlength="60" value="${esc(c.name)}" placeholder="7-A">
</label>
<label>O’quvchilar ro’yxati (ixtiyoriy)<textarea id="class-students" placeholder="Aliyev Ali&#10;Valiyeva Malika">${esc(c.students.map((s) => s.surname + ' ' + s.name).join('\n'))}</textarea>
</label>
<p class="help">Har qatorda bitta Familiya Ism. Ro’yxatdan qatorni olib tashlash o’quvchini o’chiradi.</p>
</form>`,
    { confirm: 'Saqlash' }
  );
  if (!dialog) return;
  await post(
    'classes' + (id ? '/' + id : ''),
    {
      name: dialog.querySelector('#class-name').value,
      roster: dialog.querySelector('#class-students').value,
    },
    id ? 'PUT' : 'POST'
  );
  toast('Sinf saqlandi.');
  await refresh();
}
