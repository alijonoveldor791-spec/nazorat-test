import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { ApiError, api, clearToken, getToken, setToken } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import type { AdminSession } from '../../types/api';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let cancelled = false;
    api<AdminSession>('admin/session', { token })
      .then((session) => {
        if (cancelled) return;
        navigate(session.role === 'super_admin' ? '/bosh-admin' : '/oqituvchi', { replace: true });
      })
      .catch(() => {
        if (!cancelled) clearToken();
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await api<{ token: string; role: string }>('admin/login', {
        method: 'POST',
        body: JSON.stringify({ login: login.trim(), password }),
      });
      setToken(result.token);
      toast('Kabinetga xush kelibsiz.');
      navigate(result.role === 'super_admin' ? '/bosh-admin' : '/oqituvchi', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Kirish amalga oshmadi. Ma'lumotlarni tekshiring.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PublicHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 lg:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                O'qituvchi kabinetiga kirish
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Maktab admini yoki bosh admin login va paroli
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Login</span>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Masalan: school_admin"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </label>

            <PasswordInput
              label="Parol"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
            >
              <KeyRound className="h-4 w-4" />
              <span>{busy ? 'Tekshirilmoqda...' : 'Kirish'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            O'quvchimisiz?{' '}
            <Link to="/test-kirish" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Testga kirish sahifasiga o'ting
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
