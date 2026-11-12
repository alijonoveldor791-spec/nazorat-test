// Sessiya, umumiy navigatsiya va sahifa hayot sikli.
import { $ } from '../core/dom.js';
import { getToken, logout } from '../core/auth.js';
import { busy } from '../core/busy.js';
import { initTheme } from '../core/theme.js';
import { toast } from '../components/toast.js';
import { sidebar, TEACHER_PAGES } from '../components/sidebar.js';
import { skeleton } from '../components/skeleton.js';
import { refresh } from './data.js';
import { editClass } from './class-editor.js';
import { api } from '../core/api-client.js';
import { copyText } from '../core/clipboard.js';

export async function bootstrapPage(page, view, actions = {}) {
  if (!getToken()) {
    location.replace('/oqituvchi/kirish.html');
    return false;
  }
  $('app').innerHTML = `<div id="panel" class="app-shell">${sidebar(page)}<div class="admin-body">
    <header class="admin-header">
<div class="row">
<span class="badge success">● Maktab maydoni</span>
<span id="today" class="help">
</span>
</div>
    <div class="row">
<button class="btn icon secondary" data-theme-toggle aria-label="Rang rejimini almashtirish">◐</button>
      <button class="btn ghost" id="logout">Chiqish</button>
<span class="avatar" aria-label="O\'qituvchi">O'</span>
</div>
</header>
    <main id="main" tabindex="-1">
<div id="content" class="stack">${skeleton()}${skeleton()}</div>
</main>
    <footer class="page-foot">Nazorat · O\'qitish uchun ko\'proq vaqt.</footer>
</div>
</div>`;
  initTheme();
  $('today').textContent = new Date().toLocaleDateString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  $('logout').onclick = logout;
  document.querySelector('.nav').onclick = (event) => {
    const button = event.target.closest('[data-page]');
    if (button) location.assign('/oqituvchi/' + TEACHER_PAGES[button.dataset.page][0]);
  };
  const commands = {
    'new-test': () => location.assign('/oqituvchi/test-tahrir.html'),
    'new-class': () => editClass(),
    'show-results': () => location.assign('/oqituvchi/natijalar.html'),
    refresh: async () => {
      await refresh(page);
      toast("Ma'lumotlar yangilandi.");
    },
    ...actions,
  };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button && commands[button.dataset.action])
      busy(button, () => commands[button.dataset.action](button.dataset.id));
  });
  document.addEventListener('teacher:data', () => {
    const active = document.activeElement,
      id = active?.id,
      start = active?.selectionStart,
      end = active?.selectionEnd;
    $('content').innerHTML = view();
    const replacement = id && document.getElementById(id);
    if (replacement) {
      replacement.focus({ preventScroll: true });
      if (typeof start === 'number' && replacement.setSelectionRange)
        try {
          replacement.setSelectionRange(start, end);
        } catch {}
    }
  });
  try {
    const session = await api('admin/session', { token: getToken() });
    if (session.role === 'super_admin') {
      location.replace('/bosh-admin/index.html');
      return false;
    }
    document.querySelector('.admin-header .badge').textContent =
      session.role === 'school_admin'
        ? session.schoolName + ' · Maktab ID: ' + (session.public_school_id || 'Biriktirilmagan')
        : "Eski ma'lumotlar admini";
    if (session.role === 'school_admin' && session.public_school_id) {
      const copy = document.createElement('button');
      copy.id = 'copy-school-id';
      copy.className = 'btn secondary small';
      copy.textContent = 'Maktab IDsini nusxalash';
      copy.addEventListener('click', () => copyText(session.public_school_id));
      document.querySelector('.admin-header .badge').parentElement.append(copy);
    }
    await refresh(page);
  } catch (error) {
    toast(error.message, true);
    if (error.status === 401) logout();
    else $('content').textContent = error.message;
    return false;
  }
  return true;
}
