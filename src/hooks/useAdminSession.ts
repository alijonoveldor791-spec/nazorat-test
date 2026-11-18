import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminSession } from '../types/api';
import { adminApi, ApiError, clearToken, getToken } from '../lib/api';

export function useAdminSession(
  allowedRoles: 'teacher' | 'super_admin' | AdminSession['role'][]
) {
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const roles: AdminSession['role'][] =
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
    adminApi<AdminSession>('session')
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
