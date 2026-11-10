// teacher/class-editor.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

import { data, refresh } from './data.js';
import { post } from './teacher-api.js';

export async function editClass(id) {
  const c = data.classes.find((c) => c.id === id) || { name: '', students: [] };
  const pending = modal(
    id ? 'Sinfni tahrirlash' : "Sinf yoki guruh qo'shish",
    `<form class="stack">
<label>Tur<select id="class-kind"><option value="class" ${c.kind !== 'group' ? 'selected' : ''}>Sinf</option><option value="group" ${c.kind === 'group' ? 'selected' : ''}>Guruh</option></select></label>
<label id="direction-label">Yo'nalish nomi<input id="class-direction" maxlength="100" value="${esc(c.direction || '')}"></label>
<label>Nom<input id="class-name" required maxlength="60" value="${esc(c.name)}" placeholder="7-A">
</label>
<label>O'quvchilar ro'yxati (ixtiyoriy)<textarea id="class-students" placeholder="Aliyev Ali&#10;Valiyeva Malika">${esc(c.students.map((s) => s.surname + ' ' + s.name).join('\n'))}</textarea>
</label>
<p class="help">Har qatorda bitta Familiya Ism. Ro'yxatdan qatorni olib tashlash o'quvchini o'chiradi.</p>
</form>`,
    {
      confirm: 'Saqlash',
      onConfirm: async (dialog) => {
        await post(
          'classes' + (id ? '/' + id : ''),
          {
            name: dialog.querySelector('#class-name').value,
            kind: dialog.querySelector('#class-kind').value,
            direction: dialog.querySelector('#class-direction').value,
            roster: dialog.querySelector('#class-students').value,
          },
          id ? 'PUT' : 'POST'
        );
      },
    }
  );
  const form = document.querySelector('dialog:last-of-type');
  const update = () => {
    const group = form.querySelector('#class-kind').value === 'group';
    form.querySelector('#direction-label').hidden = !group;
    form.querySelector('#class-direction').required = group;
  };
  form.querySelector('#class-kind').addEventListener('change', update);
  update();
  const dialog = await pending;
  if (!dialog) return;
  toast('Sinf saqlandi.');
  await refresh();
}
