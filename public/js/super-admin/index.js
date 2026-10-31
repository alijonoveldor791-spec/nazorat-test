// Bosh admin sessiyasi, maktab, obuna va admin hisob formalarini boshqaradi.
import { api } from '../core/api-client.js';
import { getToken, logout } from '../core/auth.js';
import { $, esc } from '../core/dom.js';
import { initTheme } from '../core/theme.js';
initTheme();
const call = (path, method = 'GET', body) =>
  api('super-admin/' + path, {
    token: getToken(),
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
$('logout').addEventListener('click', logout);
async function load() {
  $('status').textContent = 'Yuklanmoqda…';
  const rows = await call('schools');
  $('schools').innerHTML =
    rows
      .map(
        (row) => `<article class="card stack">
    <h2>${esc(row.name)}</h2><p>Maktab IDsi: ${esc(row.id)}</p>
    <p>Obuna: ${esc(row.subscription?.status || 'Belgilanmagan')} · ${esc(row.subscription?.endsAt || '')}</p>
    <form data-kind="name" data-id="${esc(row.id)}" class="stack">
      <label>Maktab nomi<input name="name" value="${esc(row.name)}" maxlength="160" required></label>
      <button class="btn secondary">Nomni saqlash</button>
    </form>
    ${
      row.adminLogin
        ? `<p>Admin: ${esc(row.adminLogin)}</p>`
        : `<form data-kind="admin" data-id="${esc(row.id)}" class="stack">
      <h3>Maktab adminini yaratish</h3>
      <label>Login<input name="login" required minlength="3" maxlength="60" autocomplete="off"></label>
      <label>Parol<input name="password" type="password" required minlength="6" maxlength="12" autocomplete="new-password"></label>
      <button class="btn">Admin yaratish</button></form>`
    }
    <form data-kind="subscription" data-id="${esc(row.id)}" class="stack">
      <label>Obuna holati<select name="status"><option value="active">Faol</option><option value="expired" ${row.subscription?.status === 'expired' ? 'selected' : ''}>Tugagan</option></select></label>
      <label>Obuna tugashi (Toshkent vaqti)<input name="endsAt" type="datetime-local" required></label>
      <button class="btn secondary">Obunani saqlash</button>
    </form>
  </article>`
      )
      .join('') || '<p>Maktablar hali yaratilmagan.</p>';
  $('status').textContent = `${rows.length} ta maktab`;
}
async function execute(action, button) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try {
    await action();
  } catch (error) {
    $('status').textContent = error.message;
  } finally {
    if (button) button.disabled = false;
  }
}
$('refresh').addEventListener('click', (event) => execute(load, event.target));
$('school-form').addEventListener('submit', (event) => {
  event.preventDefault();
  execute(async () => {
    await call('schools', 'POST', { name: $('school-name').value });
    $('school-form').reset();
    await load();
  }, event.submitter);
});
$('schools').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target,
    values = Object.fromEntries(new FormData(form));
  execute(async () => {
    let path = 'schools/' + form.dataset.id,
      method = 'PUT';
    if (form.dataset.kind === 'admin') {
      path += '/admin';
      method = 'POST';
    }
    if (form.dataset.kind === 'subscription') {
      path += '/subscription';
      values.endsAt = new Date(values.endsAt + ':00+05:00').toISOString();
    }
    await call(path, method, values);
    await load();
  }, event.submitter);
});
try {
  const session = await api('admin/session', { token: getToken() });
  if (session.role !== 'super_admin') location.replace('/oqituvchi/index.html');
  else await load();
} catch (error) {
  if (error.status === 401) location.replace('/oqituvchi/kirish.html');
  else $('status').textContent = error.message;
}
