export const $ = id => document.getElementById(id);
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const storage = {
  get(key, fallback = null) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};
const theme = storage.get('nazorat-theme');
if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
document.querySelectorAll('[data-theme-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    storage.set('nazorat-theme', dark ? 'light' : 'dark');
  });
});
export function toast(message, error = false) {
  let host = $('toasts');
  if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.className = 'toasts'; host.setAttribute('role', 'status'); document.body.append(host); }
  const node = document.createElement('div'); node.className = 'toast' + (error ? ' error' : ''); node.textContent = message; host.append(node);
  setTimeout(() => node.remove(), 5500);
}
export async function api(path, {token, ...options} = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  let response;
  try { response = await fetch('/api/' + path, {...options, headers, cache:'no-store'}); }
  catch { throw new Error('Internet aloqasi yo’q. Qayta urinib ko’ring.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'So’rov bajarilmadi. Qayta urinib ko’ring.'); error.status = response.status; throw error; }
  return data;
}
export function modal(title, html, {confirm = 'Tasdiqlash', cancel = 'Bekor qilish', danger = false} = {}) {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    const headingId = 'dialog-' + crypto.randomUUID();
    dialog.setAttribute('aria-labelledby', headingId);
    dialog.innerHTML = `<h2 id="${headingId}">${esc(title)}</h2><div class="dialog-body">${html}</div><div class="dialog-actions"><button class="btn secondary" data-cancel>${esc(cancel)}</button>${confirm ? `<button class="btn ${danger ? 'danger' : ''}" data-confirm>${esc(confirm)}</button>` : ''}</div>`;
    document.body.append(dialog);
    dialog.querySelector('[data-cancel]').onclick = () => dialog.close('cancel');
    const accept = dialog.querySelector('[data-confirm]');
    if (accept) accept.onclick = () => { if (dialog.querySelector('form')?.reportValidity() === false) return; dialog.close('confirm'); };
    dialog.addEventListener('close', () => { resolve(dialog.returnValue === 'confirm' ? dialog : null); dialog.remove(); }, {once:true});
    dialog.showModal();
  });
}
export const confirmAction = async (title, message) => Boolean(await modal(title, `<p>${esc(message)}</p>`, {danger:true}));
export function download(name, text, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], {type})); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const percent = row => row.total ? Math.round(row.score / row.total * 100) : 0;
export const dateTime = value => value ? new Date(value).toLocaleString('uz-UZ', {timeZone:'Asia/Tashkent'}) : '—';
export const empty = (title, description = '') => `<div class="empty"><b>${esc(title)}</b><p>${esc(description)}</p></div>`;
export function busy(button, task) {
  button.disabled = true;
  return Promise.resolve().then(task).catch(error => toast(error.message, true)).finally(() => { button.disabled = false; });
}
