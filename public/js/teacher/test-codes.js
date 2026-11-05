// Test kartasidagi umumiy kod, nusxalash va holat amallarini boshqaradi.
import { esc } from '../core/dom.js';
import { action } from '../components/page-heading.js';
import { confirmAction } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { data, refresh } from './data.js';
import { post } from './teacher-api.js';
import { cardIcon } from '../components/card-icons.js';
const LABELS = { inactive: 'Nofaol', active: 'Faol', revoked: 'Bekor qilingan' };
const COPY_TIMERS = new WeakMap();
export function codeCard(test) {
  const code = test.testCode;
  if (!code) return '<p class="help">Kod uchun maktab bog\'lanishi kerak.</p>';
  return `<section class="test-card-code" aria-label="Umumiy test kodi">
    <div class="test-card-code-heading"><span>Umumiy test kodi</span><span class="test-card-code-state ${esc(code.state)}">${LABELS[code.state]}</span></div>
    <div class="test-card-code-row"><strong class="test-code-value" data-test-code="${esc(test.id)}">${esc(code.value)}</strong>
    ${action('copy-test-code', `${cardIcon('copy')}<span class="copy-label" role="status">Kodni nusxalash</span>`, test.id, 'secondary test-card-copy')}</div>
  </section>`;
}
export function codeMenuActions(test) {
  const code = test.testCode;
  if (!code) return '';
  return `${code.state === 'inactive' ? action('activate-test-code', 'Kodni faollashtirish', test.id, 'secondary') : ''}${code.state !== 'revoked' ? action('revoke-test-code', 'Kodni bekor qilish', test.id, 'danger') : action('replace-test-code', 'Yangi kod yaratish', test.id, 'secondary')}`;
}
const selected = (id) => {
  const test = data.tests.find((row) => row.id === id);
  if (!test?.testCode) throw new Error('Kod topilmadi. Sahifani yangilang.');
  return test;
};
async function change(id, kind) {
  const test = selected(id);
  if (
    kind === 'revoke' &&
    !(await confirmAction(
      'Kod bekor qilinsinmi?',
      "Yangi urinishlar yopiladi. Boshlangan urinishlarning muddati o'zgarmaydi."
    ))
  )
    return;
  if (
    kind === 'replace' &&
    !(await confirmAction(
      'Yangi kod yaratilsinmi?',
      "Oldingi kod qayta ishlamaydi. Yangi kod barcha qatnashchilar uchun umumiy bo'ladi."
    ))
  )
    return;
  await post('tests/' + id + '/code', { action: kind, version: test.testCode.version });
  await refresh('tests');
  toast('Kod holati saqlandi.');
}
export const codeActions = {
  'copy-test-code': async (id) => {
    const code = selected(id).testCode.value;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard mavjud emas.');
      await navigator.clipboard.writeText(code);
      const button = [...document.querySelectorAll('[data-action="copy-test-code"]')].find(
        (node) => node.dataset.id === id
      );
      const label = button?.querySelector('.copy-label');
      if (label) {
        clearTimeout(COPY_TIMERS.get(label));
        label.textContent = 'Nusxalandi \u2713';
        COPY_TIMERS.set(
          label,
          setTimeout(() => {
            if (label.isConnected) label.textContent = 'Kodni nusxalash';
          }, 2000)
        );
      } else toast('Kod nusxalandi.');
    } catch {
      toast("Nusxalanmadi. Kartadagi kodni qo'lda yozib oling.", true);
    }
  },
  'activate-test-code': (id) => change(id, 'activate'),
  'revoke-test-code': (id) => change(id, 'revoke'),
  'replace-test-code': (id) => change(id, 'replace'),
};
