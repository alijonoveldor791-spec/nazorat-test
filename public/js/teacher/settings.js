// teacher/settings.js: sahifaning shu vazifasi uchun modul.
import { $ } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { confirmAction } from '../components/modal.js';

import { busy } from '../core/busy.js';

import { download } from '../core/download.js';
import { data, refresh } from './data.js';
import { call, post } from './teacher-api.js';
import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { logout } from '../core/auth.js';
import { passwordField, initPasswordVisibility } from '../components/password-field.js';
initPasswordVisibility();
export function settingsView() {
  return (
    heading('Sozlamalar', "Kirish va maktab ma'lumotlarini boshqaring.") +
    `<div class="two-col">
<section class="card stack">
<h2>Parolni o\'zgartirish</h2>
<p>Yangi parol ${data.passwordMinLength || 6}–${data.passwordMaxLength || 12} belgidan iborat bo\'lsin. Saqlangach barcha eski sessiyalar tugaydi.</p>
<form id="password-form" class="stack">
${passwordField('old-password', 'Joriy parol')}
${passwordField('new-password', 'Yangi parol', 'new-password', data.passwordMinLength || 6, data.passwordMaxLength || 12)}
<button type="submit" class="btn">Yangi parolni saqlash</button>
</form>
</section>
<section class="card stack">
<h2>Zaxira va tiklash</h2>
<p>Testlar, sinflar va natijalar bitta JSON faylda. Formulalar va ichki rasmlar saqlanadi. Asl Word fayllari, parol va token kaliti zaxiraga kiritilmaydi.</p>${action('backup', 'Zaxira nusxa yuklab olish', '', 'secondary')}${
      data.role === 'legacy_admin'
        ? `<label>Zaxiradan tiklash<input type="file" id="restore-file" accept=".json,application/json">
</label>
<p class="help">Tiklash mavjud yozuvlarga ID bo\'yicha qo\'shiladi; bir xil ID yangilanadi.</p>
<hr>
<h3>Ma\'lumotlarni tozalash</h3>
<p>Bu amal maktabga biriktirilmagan eski sinflar, testlar, urinishlar va natijalarni o‘chiradi. Avval zaxira oling.</p>${action('clear', "Eski ma'lumotlarni tozalash", '', 'danger')}`
        : '<p class="help">Faqat o‘z maktabingiz zaxirasi olinadi. Tiklash va tozalash vakolati hali berilmagan.</p>'
    }</section>
</div>`
  );
}
bootstrapPage('settings', settingsView, {
  backup: async () => {
    const backup = await call('backup');
    download(
      'nazorat-zaxira-' + new Date().toISOString().slice(0, 10) + '.json',
      JSON.stringify(backup, null, 2),
      'application/json'
    );
    toast('Zaxira tayyor.');
  },
  clear: async () => {
    if (
      await confirmAction(
        "Barcha ma'lumotlar o'chirilsinmi?",
        "Sinf, test, urinish va natijalar qaytarib bo'lmaydigan tarzda o'chiriladi. Zaxira olinganiga ishonch hosil qiling."
      )
    ) {
      await post('clear', { confirmation: 'HAMMASINI OCHIRISH' });
      await refresh();
      toast("Ma'lumotlar tozalandi.");
    }
  },
});
$('content')?.addEventListener('change', async (event) => {
  if (event.target.id !== 'restore-file') return;
  try {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 4_000_000) throw new Error('Zaxira 4 MB dan oshmasin.');
    const backup = JSON.parse(await file.text());
    if (
      await confirmAction(
        'Zaxira tiklansinmi?',
        'Bir xil ID dagi yozuvlar yangilanadi. Avval joriy zaxirani yuklab oling.'
      )
    ) {
      await post('restore', backup);
      await refresh();
      toast('Zaxira tiklandi.');
    }
  } catch (error) {
    toast(error.message, true);
  }
});
$('content')?.addEventListener('submit', (event) => {
  if (event.target.id !== 'password-form') return;
  event.preventDefault();
  busy(event.target.querySelector('button[type="submit"]'), async () => {
    await post('password', {
      currentPassword: $('old-password').value,
      newPassword: $('new-password').value,
    });
    toast('Parol yangilandi. Qayta kiring.');
    logout();
  });
});
