// Test kartasidagi umumiy kod, nusxalash va holat amallarini boshqaradi.
import { esc } from '../core/dom.js';
import { action } from '../components/page-heading.js';
import { confirmAction } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { data, refresh } from './data.js';
import { post } from './teacher-api.js';
const LABELS = { inactive: 'Nofaol', active: 'Faol', revoked: 'Bekor qilingan' };
export function codeCard(test) {
  const code = test.testCode;
  if (!code) return '<p class="help">Kod uchun maktab bog\'lanishi kerak.</p>';
  return `<section class="stack" aria-label="Umumiy test kodi">
    <div class="row between"><span>Umumiy test kodi</span><span class="badge neutral">${LABELS[code.state]}</span></div>
    <strong class="test-code-value" data-test-code="${esc(test.id)}">${esc(code.value)}</strong>
    <div class="row">${action('copy-test-code', 'Kodni nusxalash', test.id, 'secondary small')}${
      code.state === 'inactive'
        ? action('activate-test-code', 'Kodni faollashtirish', test.id, 'ghost small')
        : ''
    }${code.state !== 'revoked' ? action('revoke-test-code', 'Kodni bekor qilish', test.id, 'ghost small') : action('replace-test-code', 'Yangi kod yaratish', test.id, 'ghost small')}</div>
  </section>`;
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
      toast('Kod nusxalandi.');
    } catch {
      toast("Nusxalanmadi. Kartadagi kodni qo'lda yozib oling.", true);
    }
  },
  'activate-test-code': (id) => change(id, 'activate'),
  'revoke-test-code': (id) => change(id, 'revoke'),
  'replace-test-code': (id) => change(id, 'replace'),
};
