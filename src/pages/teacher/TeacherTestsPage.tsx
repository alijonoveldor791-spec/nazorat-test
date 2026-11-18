import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  Clock,
  Copy,
  Download,
  Edit3,
  FilePlus2,
  HelpCircle,
  KeyRound,
  LayoutGrid,
  List,
  PauseCircle,
  PlayCircle,
  Repeat,
  Search,
  Shuffle,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost } from '../../lib/api';
import { copyToClipboard, downloadBlob, formatDateTime } from '../../lib/format';
import type { SchoolClass, TestItem } from '../../types/api';

const STATUS_LABELS: Record<string, string> = {
  active: 'Faol',
  paused: "To'xtatilgan",
  scheduled: 'Jadvalda',
  ended: 'Yakunlangan',
};

const CODE_STATE_LABELS: Record<string, string> = {
  inactive: 'Nofaol',
  active: 'Faol',
  revoked: 'Bekor qilingan',
};

export function TeacherTestsPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tests, setTests] = useState<TestItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  const [audience, setAudience] = useState<'all' | 'class' | 'group'>('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [assignTestItem, setAssignTestItem] = useState<TestItem | null>(null);
  const [assignDirection, setAssignDirection] = useState('');
  const [assignClassIds, setAssignClassIds] = useState<Set<string>>(new Set());

  const [deleteTarget, setDeleteTarget] = useState<TestItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [codeConfirm, setCodeConfirm] = useState<{
    test: TestItem;
    action: 'revoke' | 'replace';
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tst, cls] = await Promise.all([
        adminApi<TestItem[]>('tests'),
        adminApi<SchoolClass[]>('classes'),
      ]);
      setTests(tst);
      setClasses(cls);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Testlarni yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData();
    }
  }, [sessionLoading, session, loadData]);

  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const visibleTests = useMemo(() => {
    return tests
      .filter((t) => {
        if (audience === 'all') return true;
        return t.classIds.some((id) => (classMap.get(id)?.kind || 'class') === audience);
      })
      .filter(
        (t) =>
          t.title.toLowerCase().includes(query.trim().toLowerCase()) &&
          (!statusFilter || t.status === statusFilter)
      )
      .sort(
        (a, b) =>
          (sortOrder === 'oldest' ? 1 : -1) *
          String(a.createdAt || a.created || '').localeCompare(String(b.createdAt || b.created || ''))
      );
  }, [tests, audience, classMap, query, statusFilter, sortOrder]);

  const handleCopyCode = async (test: TestItem) => {
    if (!test.testCode?.value) return;
    const ok = await copyToClipboard(test.testCode.value);
    if (ok) {
      setCopiedId(test.id);
      setTimeout(() => setCopiedId((prev) => (prev === test.id ? null : prev)), 2000);
    } else {
      toast("Nusxalanmadi. Kartadagi kodni qo'lda yozib oling.", true);
    }
  };

  const handleCodeAction = async (test: TestItem, action: 'activate' | 'revoke' | 'replace') => {
    if (!test.testCode) return;
    try {
      await adminPost(`tests/${test.id}/code`, { action, version: test.testCode.version });
      setCodeConfirm(null);
      toast('Kod holati saqlandi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Kod holatini o'zgartirib bo'lmadi.", true);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminPost(`tests/${id}/toggle`);
      toast('Test holati yangilandi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Holatni o'zgartirib bo'lmadi.", true);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await adminPost(`tests/${id}/duplicate`);
      toast('Test nusxasi yaratildi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Nusxa olib bo'lmadi.", true);
    }
  };

  const handleExportAiken = async (id: string) => {
    try {
      const full = await adminApi<TestItem>(`tests/${id}`);
      if (full.questions.some((q) => q.contentFormat === 'rich-html-v1')) {
        toast(
          "Word formatidagi rasm, jadval va formulalarni Aiken .txt fayliga yo'qotishsiz o'tkazib bo'lmaydi.",
          true
        );
        return;
      }
      const text = full.questions
        .map(
          (q) =>
            `${q.q}\n${q.options.map((o, idx) => `${'ABCDEF'[idx]}. ${o}`).join('\n')}\nANSWER: ${'ABCDEF'[q.answer ?? 0]}`
        )
        .join('\n\n');
      downloadBlob(`test-${id}.txt`, text);
      toast('Aiken fayli tayyor.');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Eksport qilib bo'lmadi.", true);
    }
  };

  const handleDeleteOne = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi(`tests/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      toast("Test o'chirildi.");
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Testni o'chirib bo'lmadi.", true);
    }
  };

  const handleBulkDelete = async () => {
    const ids = visibleTests.filter((t) => selectedIds.has(t.id)).map((t) => t.id);
    if (!ids.length) return;
    try {
      for (const id of ids) {
        await adminApi(`tests/${id}`, { method: 'DELETE' });
      }
      setBulkDeleteOpen(false);
      setSelectedIds(new Set());
      toast(`${ids.length} ta test o'chirildi.`);
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "O'chirishda xato yuz berdi.", true);
    }
  };

  const openAssignModal = (test: TestItem) => {
    setAssignTestItem(test);
    setAssignDirection('');
    setAssignClassIds(new Set());
  };

  const assignableClasses = useMemo(() => {
    if (!assignTestItem) return [];
    return classes.filter((c) => !assignTestItem.classIds.includes(c.id));
  }, [assignTestItem, classes]);

  const assignDirections = useMemo(
    () =>
      Array.from(
        new Set(assignableClasses.filter((c) => c.kind === 'group' && c.direction).map((c) => c.direction!))
      ),
    [assignableClasses]
  );

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTestItem) return;
    try {
      await adminPost(`tests/${assignTestItem.id}/assign`, {
        direction: assignDirection,
        classIds: Array.from(assignClassIds),
      });
      setAssignTestItem(null);
      toast('Biriktirish saqlandi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Biriktirishda xato yuz berdi.", true);
    }
  };

  const allVisibleSelected = visibleTests.length > 0 && visibleTests.every((t) => selectedIds.has(t.id));

  return (
    <AdminShell
      session={session}
      title="Testlar"
      subtitle="Savollarni tayyorlang, sinflarni biriktiring va vaqtni belgilang."
      actions={
        <button
          type="button"
          onClick={() => navigate('/oqituvchi/test-tahrir')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>Yangi test</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIds(new Set());
              }}
              placeholder="Test nomi bo'yicha qidirish..."
              aria-label="Test qidirish"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            {(
              [
                ['all', 'Barchasi'],
                ['class', 'Sinflar'],
                ['group', 'Guruhlar'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAudience(val);
                  setSelectedIds(new Set());
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  audience === val
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSelectedIds(new Set());
            }}
            aria-label="Holat filtri"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="paused">To'xtatilgan</option>
            <option value="scheduled">Jadvalda</option>
            <option value="ended">Yakunlangan</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            aria-label="Saralash"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="newest">Yangi qo'shilgan</option>
            <option value="oldest">Eski qo'shilgan</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                disabled={visibleTests.length === 0}
                onChange={() => {
                  if (allVisibleSelected) setSelectedIds(new Set());
                  else setSelectedIds(new Set(visibleTests.map((t) => t.id)));
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Hammasini tanlash</span>
            </label>
            <span className="tabular-nums text-xs">{visibleTests.length} ta test</span>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Tanlanganlarni o'chirish ({selectedIds.size})</span>
              </button>
            )}
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                viewMode === 'cards'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kartalar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Ro'yxat</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            ))}
          </div>
        ) : visibleTests.length === 0 ? (
          <EmptyState
            title="Test topilmadi"
            description="Yangi test yarating yoki qidiruv/filtrlarni o'zgartiring."
          />
        ) : (
          <div className={viewMode === 'cards' ? 'grid gap-4 md:grid-cols-2' : 'space-y-3'}>
            {visibleTests.map((test) => {
              const assignedClasses = test.classIds.map(
                (id) => classMap.get(id) || { id, name: 'Eski sinf', kind: 'class' as const }
              );
              const regularNames = assignedClasses
                .filter((c) => c.kind !== 'group')
                .map((c) => c.name)
                .join(', ');
              const groupNames = assignedClasses
                .filter((c) => c.kind === 'group')
                .map((c) => c.name)
                .join(', ');
              const qCount = test.count ?? test.questionCount ?? test.questions?.length ?? 0;
              const statusColor =
                test.status === 'active'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : test.status === 'scheduled'
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400';

              return (
                <article
                  key={test.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(test.id)}
                          onChange={() =>
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(test.id)) next.delete(test.id);
                              else next.add(test.id);
                              return next;
                            })
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium">
                            <span className={statusColor}>{STATUS_LABELS[test.status] || test.status}</span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {test.testType === 'block'
                                ? `Blok test${test.settings.scoringMode === 'dtm' ? ' (DTM 189 ball)' : ''}`
                                : 'Oddiy test'}
                            </span>
                          </div>
                          <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                            {test.title}
                          </h2>
                        </div>
                      </label>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 dark:text-slate-400">
                      {regularNames && (
                        <p>
                          Fan: <span className="font-medium text-slate-800 dark:text-slate-200">{test.subject || 'Belgilanmagan'}</span> · Sinf:{' '}
                          <span className="font-medium text-slate-800 dark:text-slate-200">{regularNames}</span>
                        </p>
                      )}
                      {groupNames && (
                        <p>
                          Yo'nalish: <span className="font-medium text-slate-800 dark:text-slate-200">{test.direction || '—'}</span> · Guruh:{' '}
                          <span className="font-medium text-slate-800 dark:text-slate-200">{groupNames}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3.5 w-3.5" />
                        {test.settings.timeLimitMin ? `${test.settings.timeLimitMin} daqiqa` : 'Vaqt cheklanmagan'}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <HelpCircle className="h-3.5 w-3.5" />
                        {qCount} savol
                        {test.settings.questionsPerAttempt ? ` / bazada ${test.bankCount ?? qCount}` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Repeat className="h-3.5 w-3.5" />
                        {test.settings.maxAttempts} urinish
                      </span>
                      {test.settings.shuffleQuestions && (
                        <span className="inline-flex items-center gap-1">
                          <Shuffle className="h-3.5 w-3.5" />
                          Aralashtiriladi
                        </span>
                      )}
                    </div>

                    {(test.schedule?.start || test.schedule?.end) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Boshlanish: {formatDateTime(test.schedule?.start)} · Tugash: {formatDateTime(test.schedule?.end)}
                      </div>
                    )}

                    {test.testCode ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                            <KeyRound className="h-3.5 w-3.5" />
                            <span>Umumiy test kodi</span>
                          </span>
                          <span
                            className={`font-semibold ${
                              test.testCode.state === 'active'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : test.testCode.state === 'revoked'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {CODE_STATE_LABELS[test.testCode.state] || test.testCode.state}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <strong className="font-mono text-lg font-bold tracking-wider text-slate-900 dark:text-white">
                            {test.testCode.value}
                          </strong>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyCode(test)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                              {copiedId === test.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Nusxalandi</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Nusxalash</span>
                                </>
                              )}
                            </button>
                            {test.testCode.state === 'inactive' && (
                              <button
                                type="button"
                                onClick={() => handleCodeAction(test, 'activate')}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap"
                              >
                                Faollashtirish
                              </button>
                            )}
                            {test.testCode.state !== 'revoked' ? (
                              <button
                                type="button"
                                onClick={() => setCodeConfirm({ test, action: 'revoke' })}
                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 whitespace-nowrap dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                Bekor qilish
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCodeConfirm({ test, action: 'replace' })}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                              >
                                Yangi kod
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Kod uchun maktab bog'lanishi kerak.</p>
                    )}
                  </div>

                  <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                    <Link
                      to={`/oqituvchi/test-tahrir?id=${encodeURIComponent(test.id)}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Tahrirlash</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggle(test.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {test.active ? (
                        <>
                          <PauseCircle className="h-3.5 w-3.5" />
                          <span>To'xtatish</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>Faollashtirish</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAssignModal(test)}
                      title="Sinf yoki guruh biriktirish"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Biriktirish</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(test.id)}
                      title="Nusxa olish"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Nusxa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportAiken(test.id)}
                      title="Aiken .txt eksport"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Aiken</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(test)}
                      aria-label={`${test.title} o'chirish`}
                      className="ml-auto inline-flex items-center rounded-lg border border-transparent p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(assignTestItem)}
        onClose={() => setAssignTestItem(null)}
        title="Sinf yoki guruh biriktirish"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAssignTestItem(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              form="assign-test-form"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Biriktirish
            </button>
          </>
        }
      >
        <form id="assign-test-form" onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Oldingi biriktirishlar saqlanadi. Qo'shimcha sinf yoki guruhlarni belgilang.
          </p>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Yo'nalish</span>
            <select
              value={assignDirection}
              onChange={(e) => {
                setAssignDirection(e.target.value);
                setAssignClassIds(new Set());
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Faqat sinflar</option>
              {assignDirections.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {assignableClasses
              .filter((c) => (!assignDirection ? c.kind !== 'group' : c.kind === 'group' && c.direction === assignDirection))
              .map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={assignClassIds.has(c.id)}
                    onChange={() =>
                      setAssignClassIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        return next;
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    {c.kind === 'group' ? 'Guruh' : 'Sinf'}: {c.name}
                  </span>
                </label>
              ))}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOne}
        title="Test o'chirilsinmi?"
        message="Eski natijalar saqlanadi. Boshlangan urinishlar yuborilmaydi."
        confirmLabel="O'chirish"
        danger
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Tanlangan testlar o'chirilsinmi?"
        message={`${selectedIds.size} ta test o'chiriladi. Eski natijalar saqlanadi.`}
        confirmLabel="O'chirish"
        danger
      />

      <ConfirmDialog
        open={Boolean(codeConfirm)}
        onClose={() => setCodeConfirm(null)}
        onConfirm={() =>
          codeConfirm ? handleCodeAction(codeConfirm.test, codeConfirm.action) : undefined
        }
        title={
          codeConfirm?.action === 'revoke' ? 'Kod bekor qilinsinmi?' : 'Yangi kod yaratilsinmi?'
        }
        message={
          codeConfirm?.action === 'revoke'
            ? "Yangi urinishlar yopiladi. Boshlangan urinishlarning muddati o'zgarmaydi."
            : "Oldingi kod qayta ishlamaydi. Yangi kod barcha qatnashchilar uchun umumiy bo'ladi."
        }
        confirmLabel={codeConfirm?.action === 'revoke' ? 'Bekor qilish' : 'Yaratish'}
        danger={codeConfirm?.action === 'revoke'}
      />
    </AdminShell>
  );
}
