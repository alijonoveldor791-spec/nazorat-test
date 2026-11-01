// Maktab yaratish/tahrirlash va admin/obuna formalarini bir marta ulaydi.
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { getToken, clearToken } from '../core/auth.js';
import { toast } from '../components/toast.js';
import { call } from './api.js';
const PENDING_KEY = 'nazorat-school-create';
let pending;
try {
  pending = JSON.parse(sessionStorage.getItem(PENDING_KEY));
} catch {}
export function bindForms({ execute, reload, show }) {
  if (pending?.name) {
    $('school-name').value = pending.name;
    $('school-region').value = pending.region || '';
  }
  $('school-form').addEventListener('submit', (event) => {
    event.preventDefault();
    execute(async () => {
      const name = $('school-name').value.trim(),
        region = $('school-region').value.trim();
      if (!pending || pending.name !== name || pending.region !== region)
        pending = { name, region, requestId: crypto.randomUUID() };
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
      } catch {}
      await call('schools', 'POST', pending);
      pending = null;
      try {
        sessionStorage.removeItem(PENDING_KEY);
      } catch {}
      $('school-form').reset();
      $('school-query').value = '';
      $('school-status').value = '';
      await reload();
      show('schools');
      toast('Maktab yaratildi.');
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
      await reload();
      toast("O'zgarishlar saqlandi.");
    }, event.submitter);
  });
  $('root-password-form').addEventListener('submit', (event) => {
    event.preventDefault();
    execute(async () => {
      await api('admin/password', {
        token: getToken(),
        method: 'POST',
        body: JSON.stringify({ currentPassword: $('root-current').value, newPassword: $('root-next').value }),
      });
      clearToken();
      location.assign('/oqituvchi/kirish.html');
    }, event.submitter);
  });
}
