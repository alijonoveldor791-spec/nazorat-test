// Admin sessiyasi va rolini server orqali tekshirib, kerakli kabinetga yo'naltiradi.
import { effect as useEffect, state as useState } from './state.js';
import { useNavigate } from './navigation.js';
import { adminApi, ApiError, clearToken, getToken } from './api.js';
export function useAdminSession(allowedRoles) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    const roles =
      allowedRoles === 'teacher'
        ? ['school_admin', 'legacy_admin']
        : allowedRoles === 'super_admin'
          ? ['super_admin']
          : allowedRoles;
    const token = getToken();
    if (!token) {
      navigate('/oqituvchi/kirish', { replace: true });
      return;
    }
    adminApi('session')
      .then((data) => {
        if (!active) return;
        if (!roles.includes(data.role)) {
          navigate(data.role === 'super_admin' ? '/bosh-admin' : '/oqituvchi', { replace: true });
          return;
        }
        setSession(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          navigate('/oqituvchi/kirish', { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Sessiyani tekshirib bo'lmadi.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  return { session, loading, error };
}
