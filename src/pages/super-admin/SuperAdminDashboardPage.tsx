import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Check,
  Copy,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, api, clearToken, getToken, superApi } from '../../lib/api';
import { copyToClipboard, formatDateTime, fromTashkentInput, toTashkentInput } from '../../lib/format';
import type { School, SchoolStats } from '../../types/api';

type SectionTab = 'schools' | 'create' | 'subscriptions' | 'statistics' | 'settings';

export function SuperAdminDashboardPage() {
  const { session, loading: sessionLoading } = useAdminSession('super_admin');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<SectionTab>('schools');
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create school
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [createBusy, setCreateBusy] = useState(false);

  // Confirm status toggle
  const [statusTarget, setStatusTarget] = useState<{ school: School; next: 'active' | 'blocked' } | null>(
    null
  );

  // Root password
  const [rootCurrent, setRootCurrent] = useState('');
  const [rootNext, setRootNext] = useState('');
  const [rootBusy, setRootBusy] = useState(false);

  const loadData = useCallback(
    async (q = searchQuery) => {
      setLoading(true);
      try {
        const path = q.trim() ? `schools?q=${encodeURIComponent(q.trim())}` : 'schools';
        const [rows, statistics] = await Promise.all([
          superApi<School[]>(path),
          superApi<SchoolStats>('statistics'),
        ]);
        setSchools(rows);
        setStats(statistics);
      } catch (err) {
        toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, toast]
  );

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData('');
    }
  }, [sessionLoading, session, loadData]);

  const countsBySchool = useMemo(
    () => new Map((stats?.bySchool || []).map((r) => [r.schoolId, r])),
    [stats]
  );

  const visibleSchools = useMemo(
    () => schools.filter((s) => !statusFilter || s.status === statusFilter),
    [schools, statusFilter]
  );

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBusy(true);
    try {
      const requestId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      await superApi('schools', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          region: newRegion.trim(),
          requestId,
        }),
      });
      setNewName('');
      setNewRegion('');
      setSearchQuery('');
      setStatusFilter('');
      toast('Maktab yaratildi.');
      setTab('schools');
      await loadData('');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Maktab yaratib bo'lmadi.", true);
    } finally {
      setCreateBusy(false);
    }
  };

  const handleToggleSchoolStatus = async () => {
    if (!statusTarget) return;
    try {
      await superApi(`schools/${encodeURIComponent(statusTarget.school.id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusTarget.next }),
      });
      setStatusTarget(null);
      toast("Maktab holati o'zgartirildi.");
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Holatni o'zgartirib bo'lmadi.", true);
    }
  };

  const handleRootPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRootBusy(true);
    try {
      await api('admin/password', {
        token: getToken(),
        method: 'POST',
        body: JSON.stringify({ currentPassword: rootCurrent, newPassword: rootNext }),
      });
      clearToken();
      toast('Parol yangilandi. Qayta kiring.');
      navigate('/oqituvchi/kirish', { replace: true });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Parolni o'zgartirib bo'lmadi.", true);
    } finally {
      setRootBusy(false);
    }
  };

  return (
    <AdminShell
      session={session}
      title="Maktablar va platforma nazorati"
      subtitle={stats?.updatedAt ? `Yangilangan vaqt: ${formatDateTime(stats.updatedAt)}` : undefined}
      actions={
        <button
          type="button"
          onClick={() => loadData()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Yangilash</span>
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami maktablar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{stats?.totalSchools ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faol maktablar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{stats?.activeSchools ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faol obunalar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">
              {stats?.activeSubscriptions ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami testlar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{stats?.totalTests ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Urinishlar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{stats?.totalAttempts ?? '—'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900">
          {(
            [
              ['schools', 'Maktablar'],
              ['create', "Maktab qo'shish"],
              ['subscriptions', 'Obunalar'],
              ['statistics', 'Statistika'],
              ['settings', 'Parol sozlamasi'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'schools' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadData(searchQuery);
              }}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Maktab nomi yoki IDsi..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Barcha holatlar</option>
                <option value="active">Faol</option>
                <option value="blocked">Bloklangan</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Qidirish
              </button>
            </form>

            {loading ? (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                ))}
              </div>
            ) : visibleSchools.length === 0 ? (
              <EmptyState title="Maktab topilmadi" description="Qidiruv yoki filtrni tekshiring." />
            ) : (
              <div className="space-y-4">
                {visibleSchools.map((school) => (
                  <SchoolManagementCard
                    key={school.id}
                    school={school}
                    counts={countsBySchool.get(school.id)}
                    copied={copiedId === school.id}
                    onCopyId={async () => {
                      const code = school.public_school_id || school.id;
                      const ok = await copyToClipboard(code);
                      if (ok) {
                        setCopiedId(school.id);
                        setTimeout(() => setCopiedId((prev) => (prev === school.id ? null : prev)), 2000);
                      } else {
                        toast('Nusxalanmadi.', true);
                      }
                    }}
                    onToggleStatus={() =>
                      setStatusTarget({
                        school,
                        next: school.status === 'blocked' ? 'active' : 'blocked',
                      })
                    }
                    onUpdated={() => loadData()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'create' && (
          <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Yangi maktab qo'shish
            </h2>
            <form onSubmit={handleCreateSchool} className="mt-4 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Maktab nomi</span>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masalan: 15-umumta'lim maktabi"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Hudud (viloyat / tuman)</span>
                <input
                  type="text"
                  maxLength={120}
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Toshkent sh., Yunusobod"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <button
                type="submit"
                disabled={createBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                <span>{createBusy ? 'Yaratilmoqda...' : 'Maktabni yaratish'}</span>
              </button>
            </form>
          </section>
        )}

        {tab === 'subscriptions' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Obunalar</h2>
            {schools.length === 0 ? (
              <p className="text-sm text-slate-500">Obunalar hali yo'q.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {schools.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {row.subscription
                        ? row.subscriptionActive
                          ? 'Faol'
                          : 'Tugagan'
                        : 'Belgilanmagan'}{' '}
                      · {formatDateTime(row.subscription?.endsAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'statistics' && stats && (
          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">Maktab</th>
                    <th className="px-4 py-3 text-right">Sinflar</th>
                    <th className="px-4 py-3 text-right">Testlar</th>
                    <th className="px-4 py-3 text-right">Urinishlar</th>
                    <th className="px-4 py-3 text-right">Natijalar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.bySchool.map((row) => {
                    const sch = schools.find((s) => s.id === row.schoolId);
                    return (
                      <tr key={row.schoolId}>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {sch?.name || row.schoolId}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{row.classes}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{row.tests}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{row.attempts}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{row.results}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'settings' && (
          <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-display text-lg font-bold">Bosh admin paroli</h2>
            </div>
            <form onSubmit={handleRootPassword} className="space-y-4">
              <PasswordInput
                label="Joriy parol"
                required
                value={rootCurrent}
                onChange={(e) => setRootCurrent(e.target.value)}
              />
              <PasswordInput
                label="Yangi parol"
                required
                minLength={6}
                maxLength={128}
                value={rootNext}
                onChange={(e) => setRootNext(e.target.value)}
              />
              <button
                type="submit"
                disabled={rootBusy}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {rootBusy ? 'Saqlanmoqda...' : 'Parolni saqlash'}
              </button>
            </form>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleSchoolStatus}
        title={statusTarget?.next === 'blocked' ? 'Maktab bloklansinmi?' : 'Maktab faollashtirilsinmi?'}
        message={
          statusTarget?.next === 'blocked'
            ? "Maktab admini kirishi yopiladi. Ma'lumotlar o'chirilmaydi."
            : "Maktab admini qayta kirishi mumkin bo'ladi."
        }
        confirmLabel={statusTarget?.next === 'blocked' ? 'Bloklash' : 'Faollashtirish'}
        danger={statusTarget?.next === 'blocked'}
      />
    </AdminShell>
  );
}

interface SchoolCardProps {
  school: School;
  counts?: { classes: number; tests: number; attempts: number; results: number };
  copied: boolean;
  onCopyId: () => void;
  onToggleStatus: () => void;
  onUpdated: () => void;
}

function SchoolManagementCard({
  school,
  counts,
  copied,
  onCopyId,
  onToggleStatus,
  onUpdated,
}: SchoolCardProps) {
  const { toast } = useToast();
  const [name, setName] = useState(school.name);
  const [region, setRegion] = useState(school.region || '');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [subStatus, setSubStatus] = useState<'active' | 'expired'>(
    school.subscription?.status || 'active'
  );
  const [endsAt, setEndsAt] = useState(toTashkentInput(school.subscription?.endsAt));
  const [busy, setBusy] = useState(false);

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await superApi(`schools/${encodeURIComponent(school.id)}`, {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim(), region: region.trim() }),
      });
      toast("O'zgarishlar saqlandi.");
      onUpdated();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await superApi(`schools/${encodeURIComponent(school.id)}/admin`, {
        method: 'POST',
        body: JSON.stringify({ login: adminLogin.trim(), password: adminPassword }),
      });
      setAdminLogin('');
      setAdminPassword('');
      toast('Maktab admini saqlandi.');
      onUpdated();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const iso = fromTashkentInput(endsAt);
      if (!iso) throw new Error('Tugash sanasini kiriting.');
      await superApi(`schools/${encodeURIComponent(school.id)}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({ status: subStatus, endsAt: iso }),
      });
      toast('Obuna yangilandi.');
      onUpdated();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span
              className={`font-semibold ${
                school.status === 'blocked'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {school.status === 'blocked' ? 'Bloklangan' : 'Faol'}
            </span>
            {school.adminLogin && (
              <span className="text-slate-500 dark:text-slate-400">· Admin: {school.adminLogin}</span>
            )}
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
            {school.name}
          </h3>
          {counts && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {counts.classes} sinf · {counts.tests} test · {counts.attempts} urinish · {counts.results}{' '}
              natija
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyId}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <span>{school.public_school_id || school.id}</span>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
              school.status === 'blocked'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400'
            }`}
          >
            {school.status === 'blocked' ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Faollashtirish</span>
              </>
            ) : (
              <>
                <ShieldBan className="h-3.5 w-3.5" />
                <span>Bloklash</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-3 dark:border-slate-800">
        <form onSubmit={handleSaveMeta} className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nomi va hududi</p>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maktab nomi"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Hudud"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Saqlash
          </button>
        </form>

        <form onSubmit={handleSaveAdmin} className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Maktab admini yaratish / almashtirish
          </p>
          <input
            type="text"
            required
            value={adminLogin}
            onChange={(e) => setAdminLogin(e.target.value)}
            placeholder="Login"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            type="password"
            required
            minLength={6}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Parol"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Adminni saqlash
          </button>
        </form>

        <form onSubmit={handleSaveSubscription} className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Obuna muddati</p>
          <select
            value={subStatus}
            onChange={(e) => setSubStatus(e.target.value as 'active' | 'expired')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="active">Faol</option>
            <option value="expired">Tugagan</option>
          </select>
          <input
            type="datetime-local"
            required
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Obunani saqlash
          </button>
        </form>
      </div>
    </article>
  );
}
