// Bosh admin bo'limlari, server ma'lumotlari va maktab holati amallarini boshqaradi.
import { api } from '../core/api-client.js';
import { getToken, logout } from '../core/auth.js';
import { $, esc } from '../core/dom.js';
import { dateTime } from '../core/format.js';
import { copyText } from '../core/clipboard.js';
import { initTheme } from '../core/theme.js';
import { confirmAction } from '../components/modal.js';
import { passwordField, initPasswordVisibility } from '../components/password-field.js';
import { call } from './api.js';
import { bindForms } from './forms.js';
import { schoolCard, metrics, statisticsTable } from './school-view.js';
initTheme();
initPasswordVisibility();
const TITLES = {
  dashboard: 'Boshqaruv paneli',
  schools: 'Maktablar',
  create: "Maktab qo'shish",
  subscriptions: 'Obunalar',
  statistics: 'Statistika',
  settings: 'Sozlamalar',
};
let schools = [],
  stats = null,
  searchVersion = 0,
  loadVersion = 0;
function show(section) {
  if (!TITLES[section]) section = 'dashboard';
  document.querySelectorAll('[data-panel]').forEach((node) => {
    node.hidden = node.dataset.panel !== section;
  });
  document.querySelectorAll('.nav [data-section]').forEach((node) => {
    node.classList.toggle('active', node.dataset.section === section);
    if (node.dataset.section === section) node.setAttribute('aria-current', 'page');
    else node.removeAttribute('aria-current');
  });
  $('page-title').textContent = TITLES[section];
  history.replaceState(null, '', section === 'dashboard' ? location.pathname : '#' + section);
}
function drawSchools(rows = schools) {
  const status = $('school-status').value;
  const visible = rows.filter((row) => !status || row.status === status);
  const counts = new Map((stats?.bySchool || []).map((row) => [row.schoolId, row]));
  $('schools').innerHTML =
    visible.map((row) => schoolCard(row, counts.get(row.id))).join('') ||
    '<p>Maktab topilmadi. Qidiruv yoki filtrni tekshiring.</p>';
}
async function reload() {
  const version = ++loadVersion;
  ++searchVersion;
  $('status').textContent = 'Yuklanmoqda…';
  const [rows, statistics] = await Promise.all([call('schools'), call('statistics')]);
  if (version !== loadVersion) return;
  schools = rows;
  stats = statistics;
  $('metrics').innerHTML = metrics(stats);
  $('statistics').innerHTML = statisticsTable(stats, schools);
  $('subscriptions').innerHTML =
    schools
      .map(
        (row) =>
          `<p><strong>${esc(row.name)}</strong> · ${row.subscription ? (row.subscriptionActive ? 'Faol' : 'Tugagan') : 'Belgilanmagan'} · ${esc(dateTime(row.subscription?.endsAt))}</p>`
      )
      .join('') || "<p>Obunalar hali yo'q.</p>";
  $('updated-at').textContent = 'Yangilangan vaqt: ' + dateTime(stats.updatedAt);
  if ($('school-query').value.trim()) await search();
  else drawSchools();
  $('status').textContent = `Jami ${rows.length} ta maktab`;
}
async function search() {
  const version = ++searchVersion;
  const rows = await call('schools?q=' + encodeURIComponent($('school-query').value.trim()));
  if (version === searchVersion) drawSchools(rows);
}
async function execute(action, button) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try {
    await action();
  } catch (error) {
    $('status').textContent = error.message;
    if (error.status === 401) location.replace('/oqituvchi/kirish.html');
  } finally {
    if (button) button.disabled = false;
  }
}
$('password-settings').innerHTML =
  `<form id="root-password-form" class="stack">${passwordField('root-current', 'Joriy parol')}${passwordField('root-next', 'Yangi parol', 'new-password', 6, 12)}<button class="btn">Parolni saqlash</button></form>`;
$('logout').addEventListener('click', logout);
$('refresh').addEventListener('click', (event) => execute(reload, event.target));
$('school-search').addEventListener('submit', (event) => {
  event.preventDefault();
  execute(search, event.submitter);
});
$('school-status').addEventListener('change', () => execute(search));
document.addEventListener('click', (event) => {
  const navigation = event.target.closest('[data-section]');
  if (navigation) show(navigation.dataset.section);
  const copy = event.target.closest('[data-copy-school]');
  if (copy) execute(() => copyText(copy.dataset.copySchool), copy);
  const state = event.target.closest('[data-school-state]');
  if (state)
    execute(async () => {
      const blocking = state.dataset.schoolState === 'blocked';
      if (
        !(await confirmAction(
          blocking ? 'Maktab bloklansinmi?' : 'Maktab faollashtirilsinmi?',
          blocking
            ? "Maktab admini kirishi yopiladi. Ma'lumotlar o'chirilmaydi."
            : "Maktab admini qayta kirishi mumkin bo'ladi."
        ))
      )
        return;
      await call('schools/' + state.dataset.id + '/status', 'PUT', { status: state.dataset.schoolState });
      await reload();
    }, state);
});
bindForms({ execute, reload, show });
show(location.hash.slice(1));
try {
  const session = await api('admin/session', { token: getToken() });
  if (session.role !== 'super_admin') location.replace('/oqituvchi/index.html');
  else await reload();
} catch (error) {
  if (error.status === 401) location.replace('/oqituvchi/kirish.html');
  else $('status').textContent = error.message;
}
