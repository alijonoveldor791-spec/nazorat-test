// O'qituvchi parolini vaqtinchalik sessiya tokeniga almashtiradi.
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { getToken, setToken, clearToken } from '../core/auth.js';
import { busy } from '../core/busy.js';
import { initTheme } from '../core/theme.js';
import { initPasswordVisibility } from '../components/password-field.js';

initTheme();
initPasswordVisibility();
$('login-form').onsubmit = (event) => {
  event.preventDefault();
  $('lerr').textContent = '';
  busy($('enter'), async () => {
    try {
      const login = await api('admin/login', {
        method: 'POST',
        body: JSON.stringify({ login: $('admin-login').value.trim(), password: $('pw').value }),
      });
      setToken(login.token);
      $('pw').value = '';
      location.assign(login.role === 'super_admin' ? '/bosh-admin/index.html' : '/oqituvchi/index.html');
    } catch (error) {
      $('lerr').textContent = error.message;
    }
  });
};
if (getToken())
  api('admin/session', { token: getToken() })
    .then((session) =>
      location.replace(session.role === 'super_admin' ? '/bosh-admin/index.html' : '/oqituvchi/index.html')
    )
    .catch(() => clearToken());
