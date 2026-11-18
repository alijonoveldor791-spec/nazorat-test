import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FilePlus2,
  Plus,
  RotateCcw,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SafeContent } from '../../components/ui/SafeContent';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost, getToken } from '../../lib/api';
import { downloadBlob, formatDateTime, formatScore, percent, resultScore } from '../../lib/format';
import type { ResultRow, SchoolClass, TestItem } from '../../types/api';

const LETTERS = 'ABCDEF';

export function TeacherDashboardPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailRow, setDetailRow] = useState<ResultRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, tst, res] = await Promise.all([
        adminApi<SchoolClass[]>('classes'),
        adminApi<TestItem[]>('tests'),
        adminApi<ResultRow[]>('results'),
      ]);
      setClasses(cls);
      setTests(tst);
      setResults(res);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData();
    }
  }, [sessionLoading, session, loadData]);

  const metrics = useMemo(() => {
    const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
    const todayCount = results.filter(
      (r) => new Date(r.time).toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' }) === todayDate
    ).length;
    const activeTestsCount = tests.filter((t) => t.status === 'active').length;
    const avg = results.length
      ? Math.round(results.reduce((sum, row) => sum + percent(row), 0) / results.length)
      : null;
    return { todayCount, activeTestsCount, classesCount: classes.length, avg };
  }, [results, tests, classes]);

  const recentResults = useMemo(
    () => [...results].sort((a, b) => String(b.time).localeCompare(String(a.time))).slice(0, 5),
    [results]
  );

  const classChartData = useMemo(() => {
    const grouped = new Map<string, { name: string; totalPct: number; count: number }>();
    for (const r of results) {
      const key = r.grade || 'Belgilanmagan';
      const entry = grouped.get(key) || { name: key, totalPct: 0, count: 0 };
      entry.totalPct += percent(r);
      entry.count += 1;
      grouped.set(key, entry);
    }
    return Array.from(grouped.values())
      .map((item) => ({ ...item, avg: Math.round(item.totalPct / item.count) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);
  }, [results]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const row = await adminApi<ResultRow>('results/' + encodeURIComponent(id));
      setDetailRow(row);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Natija tafsilotini yuklab bo'lmadi.", true);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadWord = async (id: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/admin/results/' + encodeURIComponent(id) + '/word', {
        headers: { Authorization: 'Bearer ' + getToken() },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Word faylni yuklab bo'lmadi.");
      }
      const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let filename = 'test-varaqasi.docx';
      const encoded = /filename\*=UTF-8''([^;]+)/i.exec(response.headers.get('content-disposition') || '')?.[1];
      if (encoded) {
        try {
          filename = decodeURIComponent(encoded);
        } catch {
          // keep default
        }
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      downloadBlob(filename, bytes, mime);
      toast('Word varaqasi yuklandi.');
    } catch (err) {
      toast(
        err instanceof Error && err.name === 'AbortError'
          ? "Word faylni tayyorlash vaqti tugadi. Qayta urinib ko'ring."
          : err instanceof Error
            ? err.message
            : "Word faylni yuklab bo'lmadi.",
        true
      );
    } finally {
      clearTimeout(timer);
    }
  };

  const handleAllowRetake = async (id: string) => {
    try {
      await adminPost('results/' + encodeURIComponent(id) + '/retake');
      toast('Qayta topshirishga ruxsat berildi.');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Ruxsat berishda xato yuz berdi.", true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi('results/' + encodeURIComponent(deleteTarget), { method: 'DELETE' });
      setDeleteTarget(null);
      setDetailRow(null);
      toast("Natija o'chirildi.");
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Natijani o'chirib bo'lmadi.", true);
    }
  };

  return (
    <AdminShell
      session={session}
      title="Bosh sahifa"
      subtitle="Maktabingizdagi testlar va o'quvchilar natijalari."
      actions={
        <>
          <button
            type="button"
            onClick={() => navigate('/oqituvchi/test-tahrir')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Yangi test</span>
          </button>
          <Link
            to="/oqituvchi/sinflar"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span>Sinf yoki guruh</span>
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Bugungi topshirishlar</span>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : metrics.todayCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Toshkent vaqti bo'yicha</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Faol testlar</span>
              <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : metrics.activeTestsCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Jami {tests.length} ta testdan</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Sinflar va guruhlar</span>
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {loading ? '—' : metrics.classesCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Joriy maktab bo'yicha</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">O'rtacha natija</span>
              <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {loading || metrics.avg === null ? '—' : `${metrics.avg}%`}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Barcha topshirishlar bo'yicha</p>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Oxirgi natijalar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Eng so'nggi 5 ta topshirish</p>
              </div>
              <Link
                to="/oqituvchi/natijalar"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap dark:text-blue-400"
              >
                <span>Barchasini ko'rish</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : recentResults.length === 0 ? (
              <EmptyState
                title="Hali topshirishlar yo'q"
                description="O'quvchilar test topshirganidan keyin eng so'nggi natijalar shu yerda ko'rinadi."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="pb-3 pr-3">O'quvchi</th>
                      <th className="pb-3 pr-3">Test</th>
                      <th className="pb-3 pr-3 text-right">Ball</th>
                      <th className="pb-3 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {recentResults.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 pr-3">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {row.surname} {row.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{row.grade}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="max-w-[180px] truncate text-slate-700 dark:text-slate-200">
                            {row.testTitle}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDateTime(row.time)}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {percent(row)}%
                          </span>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {row.score}/{row.total}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openDetail(row.id)}
                            disabled={detailLoading}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ko'rish</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Sinflar bo'yicha o'rtacha foiz
              </h2>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : classChartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Grafik uchun natijalar yetarli emas.
              </p>
            ) : (
              <div className="space-y-3.5">
                {classChartData.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="truncate text-slate-700 dark:text-slate-200">
                        {item.name} <span className="text-slate-400">({item.count})</span>
                      </span>
                      <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                        {item.avg}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                        style={{ width: `${Math.max(4, item.avg)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
              Har bir sinf yoki guruhning topshirishlari asosida hisoblanadi.
            </p>
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        title="Natija tafsiloti"
        size="lg"
        footer={
          detailRow && (
            <>
              <button
                type="button"
                onClick={() => handleDownloadWord(detailRow.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Word (.docx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAllowRetake(detailRow.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Qayta topshirishga ruxsat</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(detailRow.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>O'chirish</span>
              </button>
            </>
          )
        }
      >
        {detailRow && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
              <p className="font-semibold text-slate-900 dark:text-white">
                {detailRow.surname} {detailRow.name} · {detailRow.grade}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {detailRow.testTitle} · {resultScore(detailRow)} ({percent(detailRow)}%)
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sarflangan vaqt:{' '}
                {detailRow.durationSec === null ? 'Eski yozuvda saqlanmagan' : `${detailRow.durationSec} soniya`}{' '}
                · Qoidabuzarliklar: {detailRow.violationCount || 0}
                {detailRow.terminatedViolation ? ' (Qoidabuzarlik tufayli yakunlangan)' : ''}
              </p>
              {detailRow.timedOut && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Vaqt tugagach serverdagi oxirgi javoblar yakunlangan.
                </p>
              )}
            </div>

            {detailRow.sections && detailRow.sections.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {detailRow.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-800"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{sec.subject}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sec.type}</p>
                    </div>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatScore(sec.score)} / {formatScore(sec.maxScore ?? sec.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {detailRow.questions?.length ? (
              <div className="space-y-3">
                {detailRow.questions.map((q, idx) => {
                  const chosen = detailRow.answers?.[idx] ?? null;
                  const isCorrect = chosen === q.answer;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {idx + 1}. <SafeContent content={q.q} format={q.contentFormat} inline />
                      </div>
                      <div className="mt-2 space-y-1 text-xs">
                        <p className={isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                          O'quvchi javobi:{' '}
                          {chosen === null ? (
                            'Javobsiz'
                          ) : (
                            <>
                              {LETTERS[chosen]}.{' '}
                              <SafeContent content={q.options[chosen] || ''} format={q.contentFormat} inline />
                            </>
                          )}
                        </p>
                        {q.answer !== undefined && (
                          <p className="text-slate-600 dark:text-slate-300">
                            To'g'ri javob: {LETTERS[q.answer]}.{' '}
                            <SafeContent content={q.options[q.answer] || ''} format={q.contentFormat} inline />
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Batafsil javoblar saqlanmagan"
                description="Eski natija: ball va foiz to'liq ko'rsatilgan."
              />
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Natija o'chirilsinmi?"
        message="Ball va javoblar o'chiriladi."
        confirmLabel="O'chirish"
        danger
      />
    </AdminShell>
  );
}
