// Test mazmunini qayta yuklamasdan qo'shimcha sinf yoki guruh biriktiradi.
import { data, refresh } from './data.js';
import { modal } from '../components/modal.js';
import { esc } from '../core/dom.js';
import { post } from './teacher-api.js';
export async function assignTest(id) {
  const test = data.tests.find((t) => t.id === id);
  const classes = data.classes.filter((c) => !test.classIds.includes(c.id));
  const directions = [...new Set(classes.filter((c) => c.kind === 'group').map((c) => c.direction))];
  const html = `<form class="stack"><p>Oldingi biriktirishlar saqlanadi.</p><label>Yo'nalish<select id="assign-direction"><option value="">Faqat sinflar</option>${directions.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}</select></label>
  ${classes.map((c) => `<label class="check" data-direction="${esc(c.direction || '')}"><input type="checkbox" name="assign-id" value="${esc(c.id)}">${c.kind === 'group' ? 'Guruh' : 'Sinf'}: ${esc(c.name)}</label>`).join('')}</form>`;
  const pending = modal('Sinf yoki guruh biriktirish', html, {
    onConfirm: async (dialog) => {
      const direction = dialog.querySelector('#assign-direction').value;
      const classIds = [...dialog.querySelectorAll('[name=assign-id]:checked')].map((c) => c.value);
      await post('tests/' + id + '/assign', { direction, classIds });
    },
  });
  const dialog = document.querySelector('dialog:last-of-type');
  const update = () =>
    dialog.querySelectorAll('[data-direction]').forEach((label) => {
      label.hidden =
        !!label.dataset.direction &&
        label.dataset.direction !== dialog.querySelector('#assign-direction').value;
      if (label.hidden) label.querySelector('input').checked = false;
    });
  dialog.querySelector('#assign-direction').addEventListener('change', update);
  update();
  if (await pending) await refresh();
}
