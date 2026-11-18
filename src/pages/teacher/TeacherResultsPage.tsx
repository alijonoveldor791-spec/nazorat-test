import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SafeContent } from '../../components/ui/SafeContent';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost, getToken } from '../../lib/api';
import { downloadBlob, formatDateTime, formatScore, percent, resultScore } from '../../lib/format';
import { exportResultsFile } from '../../lib/xlsx';
import type { ResultRow, SchoolClass, TestAnalysis, TestItem } from '../../types/api';

const LETTERS = 'ABCDEF';

interface PagedResultsResponse {
  items: ResultRow[];
  total: number;
  page: number;
  pages: number;
}

interface ResultsOverviewResponse {
  counts: { total: number; today: number; averagePercent: number | null } | null;
  recent: { id: string; title: string }[];
  catalogue: { id: string; title: string }[];
}

export function TeacherResultsPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [overview, setOverview] = useState<ResultsOverviewResponse>({
    counts: null,
    recent: [],
    catalogue: [],
  });

  const [search, setSearch] = useState('');
  const [testId, setTestId] = useState('');
  const [classId, setClassId] = useState('');
  const [sort, setSort] = useState<'time' | 'score'>('time');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<ResultRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [detailRow, setDetailRow] = useState<ResultRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<TestAnalysis | null>(null);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  const loadMetadata = useCallback(async () => {
    try {
      const [cls, tst, ov] = await Promise.all([
        adminApi<SchoolClass[]>('classes'),
        adminApi<TestItem[]>('tests'),
        adminApi<ResultsOverviewResponse>('results/overview'),
      ]);
      setClasses(cls);
      setTests(tst);
      setOverview(ov);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    }
  }, [toast]);

  const buildQuery = useCallback(
    (p: number, pageSize = 20) => {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
        sort,
      });
      if (search.trim()) params.set('search', search.trim());
      if (testId) params.set('testId', testId);
      if (classId) params.set('classId', classId);
      return params.toString();
    },
    [search, testId, classId, sort]
  );

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi<PagedResultsResponse>(`results?${buildQuery(page, 20)}`);
      setRows(res.items || []);
      setTotal(res.total || 0);
      setPages(Math.max(1, res.pages || 1));
      if (res.page && res.page !== page) setPage(res.page);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Natijalarni yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page, toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadMetadata();
    }
  }, [sessionLoading, session, loadMetadata]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadResults();
    }
  }, [sessionLoading, session, loadResults]);

  const collectAllFiltered = async (): Promise<ResultRow[]> => {
    const collected: ResultRow[] = [];
    const ids = new Set<string>();
    let p = 1;
    let totalPages = 1;
    do {
      const batch = await adminApi<PagedResultsResponse>(`results?${buildQuery(p, 200)}`);
      if (batch.page !== p) break;
      for (const r of batch.items || []) {
        if (!ids.has(r.id)) {
          ids.add(r.id);
          collected.push(r);
        }
      }
      totalPages = batch.pages || 1;
      p += 1;
    } while (p <= totalPages);
    return collected;
  };

  const handleExport = async (excel: boolean) => {
    setExportBusy(true);
    try {
      const allRows = await collectAllFiltered();
      exportResultsFile(allRows, tests, classes, { search, classId }, excel);
      toast('Eksport tayyor.');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Eksport qilib bo'lmadi.", true);
    } finally {
      setExportBusy(false);
    }
  };

  const openAnalysis = async () => {
    const targetId = testId || tests[0]?.id;
    if (!targetId) {
      toast('Tahlil uchun test tanlang.', true);
      return;
    }
    setAnalysisBusy(true);
    try {
      const data = await adminApi<TestAnalysis>(`analysis?testId=${encodeURIComponent(targetId)}`);
      setAnalysisData(data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Tahlilni yuklab bo'lmadi.", true);
    } finally {
      setAnalysisBusy(false);
    }
  };

  const openDetail = async (id: string) => {
    try {
      const full = await adminApi<ResultRow>(`results/${encodeURIComponent(id)}`);
      setDetailRow(full);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Natija tafsilotini yuklab bo'lmadi.", true);
    }
  };

  const handleDownloadWord = async (id: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`/api/admin/results/${encodeURIComponent(id)}/word`, {
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
      toast(err instanceof Error ? err.message : "Word faylni yuklab bo'lmadi.", true);
    } finally {
      clearTimeout(timer);
    }
  };

  const handleAllowRetake = async (id: string) => {
    try {
      await adminPost(`results/${encodeURIComponent(id)}/retake`);
      toast('Qayta topshirishga ruxsat berildi.');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Xato yuz berdi.", true);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi(`results/${encodeURIComponent(deleteTarget)}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setDetailRow(null);
      toast("Natija o'chirildi.");
      await Promise.all([loadResults(), loadMetadata()]);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Natijani o'chirib bo'lmadi.", true);
    }
  };

  const testOptions = overview.catalogue.length ? overview.catalogue : tests;

  return (
    <AdminShell
      session={session}
      title="Natijalar"
      subtitle="O'quvchilar topshirishlari, tahlil va Excel/Word eksport."
      actions={
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={openAnalysis}
            disabled={analysisBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{analysisBusy ? 'Yuklanmoqda...' : 'Savollar tahlili'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport(false)}
            disabled={exportBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport(true)}
            disabled={exportBusy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Chop etish</span>
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {overview.recent.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 no-print">
            <span className="font-medium">So'nggi testlar:</span>
            {overview.recent.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTestId((prev) => (prev === item.id ? '' : item.id));
                  setPage(1);
                }}
                className={`rounded-lg border px-2.5 py-1 transition-colors ${
                  testId === item.id
                    ? 'border-blue-600 bg-blue-50 font-semibold text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 no-print">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Ism, familiya yoki sinf bo'yicha..."
              aria-label="Natija qidirish"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={testId}
            onChange={(e) => {
              setTestId(e.target.value);
              setPage(1);
            }}
            aria-label="Test filtri"
            className="max-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Barcha testlar</option>
            {testOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setPage(1);
            }}
            aria-label="Sinf filtri"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Barcha sinflar</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as 'time' | 'score');
              setPage(1);
            }}
            aria-label="Saralash"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="time">Yangi topshirilgan</option>
            <option value="score">Yuqori ball</option>
          </select>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Natijalar topilmadi"
                description="Filtrni o'zgartiring yoki o'quvchilar test topshirishini kuting."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">O'quvchi</th>
                    <th className="px-4 py-3">Sinf</th>
                    <th className="px-4 py-3">Test</th>
                    <th className="px-4 py-3 text-right">Natija</th>
                    <th className="px-4 py-3 text-right">Foiz</th>
                    <th className="px-4 py-3">Vaqt</th>
                    <th className="px-4 py-3 text-right no-print">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {r.surname} {r.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.grade}</td>
                      <td className="px-4 py-3 max-w-[220px] truncate text-slate-700 dark:text-slate-200">
                        {r.testTitle}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                        {resultScore(r)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900 dark:text-white">
                        {percent(r)}%
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap dark:text-slate-400">
                        {formatDateTime(r.time)}
                      </td>
                      <td className="px-4 py-3 text-right no-print">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetail(r.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ko'rish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadWord(r.id)}
                            aria-label="Word yuklab olish"
                            title="Word (.docx)"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400 no-print">
              <span className="tabular-nums">
                Jami {total} ta natija · {page} / {pages} sahifa
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Oldingi</span>
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span>Keyingi</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
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
                {resultScore(detailRow)} ({percent(detailRow)}%)
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sarflangan vaqt:{' '}
                {detailRow.durationSec === null ? 'Eski yozuvda saqlanmagan' : `${detailRow.durationSec} soniya`}{' '}
                · Qoidabuzarliklar: {detailRow.violationCount || 0}
                {detailRow.terminatedViolation ? ' (Qoidabuzarlik tufayli yakunlangan)' : ''}
              </p>
              {(detailRow.violationLog || []).length > 0 && (
                <details className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  <summary className="cursor-pointer font-medium">Qoidabuzarliklar logi</summary>
                  <div className="mt-1.5 space-y-1 pl-2">
                    {detailRow.violationLog!.map((ev, idx) => (
                      <p key={idx}>
                        {ev.type} · {formatDateTime(ev.at)}
                      </p>
                    ))}
                  </div>
                </details>
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

      <Modal
        open={Boolean(analysisData)}
        onClose={() => setAnalysisData(null)}
        title="Savollar tahlili"
        size="lg"
      >
        {analysisData && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
              <p className="font-semibold text-slate-900 dark:text-white">
                {analysisData.title} · {analysisData.attempts} ta batafsil natija
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Eski, javoblari saqlanmagan va boshqa tahrirdagi natijalar hisobga kiritilmaydi.
              </p>
            </div>

            {analysisData.hardest.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Eng qiyin 5 savol</h3>
                <div className="space-y-2">
                  {analysisData.hardest.map((q) => (
                    <div
                      key={q.index}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs dark:border-slate-800"
                    >
                      <div className="min-w-0 text-slate-700 dark:text-slate-200">
                        <span className="font-semibold">{q.index + 1}.</span>{' '}
                        <SafeContent content={q.q} format={q.contentFormat} inline />
                      </div>
                      <span className="font-bold tabular-nums text-red-600 shrink-0 dark:text-red-400">
                        {q.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Barcha savollar</h3>
              {analysisData.questions.map((q) => (
                <div
                  key={q.index}
                  className="rounded-xl border border-slate-200 p-4 text-xs space-y-2 dark:border-slate-800"
                >
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {q.index + 1}. <SafeContent content={q.q} format={q.contentFormat} inline />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200">
                    To'g'ri javob: <strong className="tabular-nums">{q.percent}%</strong> · {q.count} javob
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {q.distribution.map((n, idx) => `${LETTERS[idx]}: ${n}`).join(' · ')} · Javobsiz:{' '}
                    {q.unanswered}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Natija o'chirilsinmi?"
        message="Ball va javoblar o'chiriladi."
        confirmLabel="O'chirish"
        danger
      />
    </AdminShell>
  );
}
