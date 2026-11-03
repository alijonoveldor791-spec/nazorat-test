// teacher/settings.js: sahifaning shu vazifasi uchun modul.
import { $, esc } from '../core/dom.js';
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
<p>Yangi parol ${data.passwordMinLength || 6}вЂ“${data.passwordMaxLength || 128} belgigacha bo\'lsin. Saqlangach barcha eski sessiyalar tugaydi.</p>
<form id="password-form" class="stack">
${passwordField('old-password', 'Joriy parol')}
${passwordField('new-password', 'Yangi parol', 'new-password', data.passwordMinLength || 6, data.passwordMaxLength || 128)}
<button type="submit" class="btn">Yangi parolni saqlash</button>
</form>
</section>
<section class="card stack">
<h2>Zaxira va tiklash</h2>
<p>Testlar, sinflar va natijalar bitta JSON faylda. Parol va token kaliti zaxiraga kiritilmaydi.</p>${action('backup', 'Zaxira nusxa yuklab olish', '', 'secondary')}
<label>Zaxiradan tiklash<input type="file" id="restore-file" accept=".json,application/json">
</label>
<p class="help">Server faylni tekshiradi va qo\'shish/yangilash sonini ko\'rsatadi. Maktab admini faqat o\'z maktabi zaxirasini tiklaydi.</p>
${data.backupStatus ? `<p class="help">Oxirgi avtomatik zaxira: ${esc(data.backupStatus.status)}; ${data.backupStatus.created} yaratildi, ${data.backupStatus.failed} xato.</p>` : ''}
${data.backups?.length ? `<div class="stack"><h3>Avtomatik va himoya nusxalari</h3>${data.backups.map((item) => `<div class="row"><span>${esc(new Date(item.createdAt).toLocaleString('uz-UZ'))} · ${esc(item.source)}</span>${action('download-backup', 'Yuklab olish', item.id, 'secondary')}</div>`).join('')}</div>` : ''}
${data.role === 'legacy_admin'
        ? `
<hr>
<h3>Ma\'lumotlarni tozalash</h3>
<p>Bu amal maktabga biriktirilmagan eski sinflar, testlar, urinishlar va natijalarni oвЂchiradi. Avval zaxira oling.</p>${action('clear', "Eski ma'lumotlarni tozalash", '', 'danger')}`
        : ''}
${data.role === 'school_admin' ? '<p class="help">Faol urinishlar tugamaguncha tiklash boshlanmaydi.</p>' : ''}
    </section>
</div>`
  );
}
bootstrapPage('settings', settingsView, {
  'download-backup': async (id) => {
    const backup = await call('backup-archives/' + encodeURIComponent(id));
    download('nazorat-zaxira-' + new Date(backup.createdAt || Date.now()).toISOString().slice(0, 10) + '.json', JSON.stringify(backup, null, 2), 'application/json');
  },
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
    const preview = await post('restore-preview', backup);
    const { added, updated } = preview.counts;
    if (await confirmAction('Zaxira tekshirildi', `${added} ta yozuv qo\'shiladi, ${updated} ta yozuv yangilanadi. Davom etilsinmi?`)) {
      const result = await post('restore', { previewId: preview.previewId, fileHash: preview.fileHash });
      await refresh();
      toast(`${result.report.added} qo\'shildi, ${result.report.updated} yangilandi, ${result.report.errors.length} xato.`);
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
