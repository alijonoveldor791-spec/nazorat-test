// Auditoriya tanlovi va saqlashdan oldingi tekshiruv xulosasini boshqaradi.
import { esc } from '../core/dom.js';
import { modal } from '../components/modal.js';
export function bindAudience(dialog, test, classes) {
  const selected = classes.filter((c) => test.classIds.includes(c.id));
  dialog.querySelector('#audience-class').checked =
    !selected.length || selected.some((c) => c.kind !== 'group');
  dialog.querySelector('#audience-group').checked = selected.some((c) => c.kind === 'group');
  const update = () => {
    const block = dialog.querySelector('#test-type').value === 'block';
    const shuffle = dialog.querySelector('#shuffle-q');
    shuffle.disabled = block;
    if (block) shuffle.checked = false;
    const forClass = dialog.querySelector('#audience-class').checked;
    const forGroup = dialog.querySelector('#audience-group').checked;
    const direction = dialog.querySelector('#edit-direction').value;
    dialog.querySelector('#subject-label').hidden = !forClass;
    dialog.querySelector('#test-direction-label').hidden = !forGroup;
    dialog.querySelector('#edit-direction').required = forGroup;
    dialog.querySelectorAll('[data-audience]').forEach((label) => {
      label.hidden =
        label.dataset.audience === 'group' ? !forGroup || label.dataset.direction !== direction : !forClass;
      if (label.hidden) label.querySelector('input').checked = false;
    });
  };
  for (const id of ['audience-class', 'audience-group', 'edit-direction', 'test-type'])
    dialog.querySelector('#' + id).addEventListener('change', update);
  update();
}
export async function confirmTest(payload, classes) {
  const sections = new Map();
  for (const q of payload.questions)
    if (q.section) {
      const row = sections.get(q.section.id) || { ...q.section, count: 0 };
      row.count++;
      sections.set(row.id, row);
    }
  const html = `<p>Test turi: ${payload.testType === 'block' ? 'Blok test' : 'Oddiy test'}</p><p>${esc(payload.title)} | ${payload.questions.length} savol</p>
  ${payload.settings.questionsPerAttempt ? `<p>Har urinishga bazadan ${esc(payload.settings.questionsPerAttempt)} ta savol tanlanadi.</p>` : ''}
  ${[...sections.values()].map((s) => `<p>${esc(s.type)} | ${esc(s.subject)}: ${s.count} savol</p>`).join('')}
  <p>Auditoriya: ${payload.classIds.map((id) => esc(classes.find((c) => c.id === id)?.name || id)).join(', ')}</p>
  <p>Vaqt: ${payload.settings.timeLimitMin || 'Cheksiz'} daqiqa. Urinish: ${payload.settings.maxAttempts}.</p>`;
  return Boolean(await modal('Testni saqlashni tasdiqlang', html));
}
