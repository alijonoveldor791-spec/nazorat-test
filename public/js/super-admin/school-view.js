// Bosh adminning maktab kartalari va faqat agregat statistika ko'rinishlari.
import { esc } from '../core/dom.js';
import { dateTime } from '../core/format.js';
const STATUS_LABELS = { active: 'Faol', blocked: 'Bloklangan', archived: 'Arxivlangan' };
const localDate = (value) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(Date.parse(value) + 5 * 3600000).toISOString().slice(0, 16)
    : '';
export function schoolCard(row, counts = {}) {
  const active = row.status === 'active';
  const subscribed = row.subscriptionActive;
  return `<article class="card stack" data-school-id="${esc(row.id)}">
    <div class="row between"><span class="badge ${active ? 'success' : 'neutral'}">${STATUS_LABELS[row.status] || "Noma'lum"}</span><span class="help">${esc(dateTime(row.createdAt))}</span></div>
    <div><h2>${esc(row.name)}</h2><p class="help">Hudud: ${esc(row.region || 'Belgilanmagan')}</p></div>
    <div class="school-id"><span class="help">Maktab IDsi</span><code>${esc(row.public_school_id || 'Biriktirilmagan')}</code>${row.public_school_id ? `<button class="btn secondary small" data-copy-school="${esc(row.public_school_id)}">IDni nusxalash</button>` : ''}</div>
    <dl class="school-facts"><div><dt>Admin</dt><dd>${esc(row.adminLogin || 'Biriktirilmagan')}</dd></div><div><dt>Obuna</dt><dd>${row.subscription ? (subscribed ? 'Faol' : 'Tugagan') : 'Belgilanmagan'}</dd></div><div><dt>Testlar</dt><dd>${counts.tests || 0}</dd></div><div><dt>Urinishlar</dt><dd>${counts.attempts || 0}</dd></div></dl>
    ${row.status !== 'archived' ? `<button class="btn ${active ? 'secondary' : ''}" data-school-state="${active ? 'blocked' : 'active'}" data-id="${esc(row.id)}">${active ? 'Maktabni bloklash' : 'Maktabni faollashtirish'}</button>` : ''}
    <details class="school-controls"><summary>Boshqarish</summary><div class="stack spacing-2">
      <form data-kind="name" data-id="${esc(row.id)}" class="stack">
        <h3>Maktab ma'lumotlari</h3><label>Maktab nomi<input name="name" value="${esc(row.name)}" maxlength="160" required></label>
        <label>Hudud<input name="region" value="${esc(row.region)}" maxlength="120"></label><button class="btn secondary">Ma'lumotlarni saqlash</button>
      </form>
      ${
        row.adminLogin
          ? `<p>Admin: ${esc(row.adminLogin)}</p>`
          : `<form data-kind="admin" data-id="${esc(row.id)}" class="stack">
        <h3>Maktab adminini biriktirish</h3><label>Login<input name="login" required minlength="3" maxlength="60" autocomplete="off"></label>
        <label>Parol<input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label><button class="btn">Admin yaratish</button></form>`
      }
      <form data-kind="subscription" data-id="${esc(row.id)}" class="stack">
        <h3>Obunani boshqarish</h3><label>Obuna holati<select name="status"><option value="active">Faol</option><option value="expired" ${row.subscription?.status === 'expired' ? 'selected' : ''}>Tugagan</option></select></label>
        <label>Tugash (Toshkent vaqti)<input name="endsAt" type="datetime-local" value="${localDate(row.subscription?.endsAt)}" required></label><button class="btn secondary">Obunani saqlash</button>
      </form>
    </div></details>
  </article>`;
}
export function metrics(stats) {
  return [
    ['Jami maktablar', stats.totalSchools],
    ['Faol maktablar', stats.activeSchools],
    ['Faol obunalar', stats.activeSubscriptions],
    ['Jami testlar', stats.totalTests],
    ['Jami urinishlar', stats.totalAttempts],
  ]
    .map(
      ([label, value]) => `<article class="card metric"><p>${label}</p><strong>${value}</strong></article>`
    )
    .join('');
}
export function statisticsTable(stats, rows) {
  const names = new Map(
    rows.map((row) => [row.id, row.name + ' · ' + (row.public_school_id || 'Biriktirilmagan')])
  );
  return `<div class="table-wrap"><table><thead><tr><th>Maktab</th><th>Sinflar</th><th>Testlar</th><th>Urinishlar</th><th>Natijalar</th></tr></thead><tbody>${stats.bySchool.map((row) => `<tr><td>${esc(names.get(row.schoolId) || 'Biriktirilmagan')}</td><td>${row.classes}</td><td>${row.tests}</td><td>${row.attempts}</td><td>${row.results}</td></tr>`).join('')}</tbody></table></div><p class="help">Maktabga biriktirilmagan: ${stats.unassigned.tests} test, ${stats.unassigned.attempts} urinish.</p>`;
}
