import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, RefreshCw, Trash2, X } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { SafeContent } from '../../components/ui/SafeContent';
import { api } from '../../lib/api';
import {
  clearStoredResult,
  getBrowserKey,
  loadResult,
  saveAttempt,
} from '../../lib/attemptStorage';
import { formatScore, resultScore } from '../../lib/format';
import type { StoredResult } from '../../types/api';

export function ResultPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<StoredResult | null>(() => loadResult());
  const [refreshing, setRefreshing] = useState(true);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const refresh = async (current: StoredResult | null) => {
    if (!current) {
      navigate('/', { replace: true });
      return;
    }
    setRefreshing(true);
    setRefreshFailed(false);
    try {
      const remote = await api<{ result?: StoredResult['result'] }>('attempts/resume', {
        method: 'POST',
        body: JSON.stringify({ attemptToken: current.attemptToken, browserKey: getBrowserKey() }),
      });
      if (remote.result) {
        const next: StoredResult = { ...current, result: remote.result };
        setSaved(next);
        try {
          localStorage.setItem('nazorat-result-v2', JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
    } catch {
      setRefreshFailed(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh(saved);
  }, []);

  if (!saved) return null;

  const { result, identity, title } = saved;
  const percent = result.total ? Math.round((result.score / result.total) * 100) : 0;
  const correct = result.results ? result.results.filter(Boolean).length : result.score;
  const wrong = result.total - correct;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PublicHeader ctaLabel="Bosh sahifa" ctaTo="/" />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        {result.terminatedViolation && (
          <div
            role="status"
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
          >
            Qoidalar buzilgani sababli test avtomatik yakunlandi.
          </div>
        )}

        {result.hidden ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Natija yashirilgan
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {refreshFailed
                ? "Natijani tekshirib bo'lmadi. Aloqani tekshiring va sahifani yangilang."
                : "O'qituvchi natijalarni ochganidan so'ng ball va tahlil ko'rinadi."}
            </p>
            <button
              type="button"
              disabled={refreshing}
              onClick={() => refresh(saved)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Holatni yangilash</span>
            </button>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {identity.surname} {identity.name} · {identity.grade}
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                    {title}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={refreshing}
                    onClick={() => refresh(saved)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Yangilash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearStoredResult();
                      navigate('/', { replace: true });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Tozalash</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Umumiy ball</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {resultScore(result)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Foiz ko'rsatkichi</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {percent}%
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">To'g'ri / Xato</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                    <span className="text-emerald-600 dark:text-emerald-400">{correct}</span> /{' '}
                    <span className="text-red-600 dark:text-red-400">{wrong}</span>
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {percent >= 86
                  ? "Ajoyib natija! Shu sur'atda davom eting."
                  : percent >= 60
                    ? 'Yaxshi! Yana mashq qilsangiz, yanada yuqori natijaga erishasiz.'
                    : 'Har bir urinish bilimni oshiradi. Mashq qilishda davom eting.'}
              </p>

              {result.timedOut && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Vaqt tugadi. Serverga muddatida yetib borgan javoblar baholandi.
                </p>
              )}
            </section>

            {result.sections && result.sections.length > 0 && (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.sections.map((sec, i) => (
                  <article
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sec.type}</p>
                    <h2 className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
                      {sec.subject}
                    </h2>
                    <p className="mt-3 font-mono text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {formatScore(sec.score)} / {formatScore(sec.maxScore ?? sec.total)}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      To'g'ri: {sec.correctCount ?? sec.score} / {sec.total}
                    </p>
                  </article>
                ))}
              </section>
            )}

            {result.results && result.results.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Savollar bo'yicha holat
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.results.map((ok, i) => (
                    <span
                      key={i}
                      aria-label={`${i + 1}-savol ${ok ? "to'g'ri" : "noto'g'ri"}`}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold tabular-nums ${
                        ok
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                      }`}
                    >
                      <span>{i + 1}</span>
                      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {result.review && result.review.length > 0 && (
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Javoblarni tahlil qiling
                </h2>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {result.review.map((item, idx) => {
                    const isCorrect = item.selected === item.answer;
                    return (
                      <div key={idx} className="space-y-2 py-4 first:pt-0 last:pb-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          <span className="mr-1.5 font-mono tabular-nums">{idx + 1}.</span>
                          <SafeContent value={item.q} format={item.contentFormat} />
                        </div>
                        <p
                          className={`text-sm ${
                            isCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          Sizning javobingiz:{' '}
                          {item.selected === null ? (
                            'Javobsiz'
                          ) : (
                            <SafeContent
                              value={item.options[item.selected]}
                              format={item.contentFormat}
                            />
                          )}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            To'g'ri javob:{' '}
                            <SafeContent
                              value={item.options[item.answer]}
                              format={item.contentFormat}
                            />
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="flex justify-center pt-2">
              <Link
                to="/"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Bosh sahifaga qaytish
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
