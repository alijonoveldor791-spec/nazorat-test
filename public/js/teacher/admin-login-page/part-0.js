// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { effect as useEffect, state as useState } from '../../core/state.js';
import { useNavigate } from '../../core/navigation.js';
import { PublicHeader } from '../../components/layout/public-header.js';
import { ApiError, api, clearToken, getToken, setToken } from '../../core/api.js';
import { useToast } from '../../components/toast-context.js';
import { view1 } from './view1.js';
export function part0(scope) {
  scope.navigate = useNavigate();
  ({ toast: scope.toast } = useToast());
  [scope.login, scope.setLogin] = useState('');
  [scope.password, scope.setPassword] = useState('');
  [scope.error, scope.setError] = useState('');
  [scope.busy, scope.setBusy] = useState(false);
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let cancelled = false;
    api('admin/session', { token })
      .then((session) => {
        if (cancelled) return;
        scope.navigate(session.role === 'super_admin' ? '/bosh-admin' : '/oqituvchi', { replace: true });
      })
      .catch(() => {
        if (!cancelled) clearToken();
      });
    return () => {
      cancelled = true;
    };
  }, [scope.navigate]);
  scope.handleSubmit = async (e) => {
    e.preventDefault();
    scope.setError('');
    scope.setBusy(true);
    try {
      const result = await api('admin/login', {
        method: 'POST',
        body: JSON.stringify({ login: scope.login.trim(), password: scope.password }),
      });
      setToken(result.token);
      scope.toast('Kabinetga xush kelibsiz.');
      scope.navigate(result.role === 'super_admin' ? '/bosh-admin' : '/oqituvchi', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Kirish amalga oshmadi. Ma'lumotlarni tekshiring.";
      scope.setError(msg);
    } finally {
      scope.setBusy(false);
    }
  };
  return {
    done: true,
    value: el(
      'div',
      { className: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' },
      el(PublicHeader, null),
      el('main', { className: 'mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 lg:py-20' }, view1(scope))
    ),
  };
}
