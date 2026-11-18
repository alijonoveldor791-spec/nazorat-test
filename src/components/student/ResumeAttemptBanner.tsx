import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Trash2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import {
  discardAttempt,
  finishAttempt,
  getBrowserKey,
  hasOpenAttempt,
  loadAttempt,
  saveAttempt,
} from '../../lib/attemptStorage';
import type { AttemptState, StoredResult } from '../../types/api';
import { ConfirmDialog } from '../ui/Modal';

export function ResumeAttemptBanner() {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const inspect = useCallback(async () => {
    const local = loadAttempt();
    if (!local) {
      setAttempt(null);
      return;
    }
    try {
      const remote = await api<{
        result?: StoredResult['result'];
        deadline?: string | null;
        serverNow?: string;
        answers?: (number | null)[];
        draftVersion?: number;
      }>('attempts/resume', {
        method: 'POST',
        body: JSON.stringify({ attemptToken: local.attemptToken, browserKey: getBrowserKey() }),
      });
      if (loadAttempt()?.attemptToken !== local.attemptToken) return;
      setAttempt(local);
      setHasResult(Boolean(remote.result));
      setError('');
    } catch (err) {
      if (err instanceof ApiError && [401, 403, 404].includes(err.status)) {
        setAttempt(null);
        return;
      }
      setAttempt(local);
      setError("Saqlangan testni serverda tekshirib bo'lmadi. Aloqa tiklangach qayta urinib ko'ring.");
    }
  }, []);

  useEffect(() => {
    inspect();
    window.addEventListener('online', inspect);
    return () => window.removeEventListener('online', inspect);
  }, [inspect]);

  if (!attempt) return null;

  const handleContinue = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const current = loadAttempt();
      if (!current) {
        setAttempt(null);
        return;
      }
      if (await hasOpenAttempt(current.attemptId || current.attemptToken)) {
        throw new Error("Bu test boshqa oynada ochiq. O'sha oynada davom eting.");
      }
      const remote = await api<{
        result?: StoredResult['result'];
        deadline: string | null;
        serverNow: string;
        answers: (number | null)[];
        draftVersion: number;
      }>('attempts/resume', {
        method: 'POST',
        body: JSON.stringify({ attemptToken: current.attemptToken, browserKey: getBrowserKey() }),
      });
      if (remote.result) {
        finishAttempt(remote.result, current);
        navigate('/natija');
        return;
      }
      if (remote.draftVersion > current.draftVersion) {
        current.answers = remote.answers;
        current.draftVersion = remote.draftVersion;
        current.dirty = false;
      }
      current.deadline = remote.deadline;
      current.serverNow = remote.serverNow;
      current.clockReceivedAt = Date.now();
      saveAttempt(current);
      navigate('/test');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Davom ettirib bo\'lmadi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section
        aria-label="Saqlangan test urinishi"
        className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {hasResult ? 'Testingiz yakunlangan' : 'Yakunlanmagan testingiz bor'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {attempt.title} · {attempt.identity.surname} {attempt.identity.name} ·{' '}
              {attempt.identity.grade}
            </p>
            {error && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmDiscard(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Tozalash</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleContinue}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {hasResult ? <ArrowRight className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              <span>{busy ? 'Tekshirilmoqda...' : hasResult ? "Natijani ko'rish" : 'Davom etish'}</span>
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          discardAttempt();
          setAttempt(null);
          setConfirmDiscard(false);
        }}
        title="Saqlangan test qurilmadan olib tashlansinmi?"
        description="Mahalliy javoblar olib tashlanadi. Serverdagi urinish, natija va test muddati o'zgarmaydi."
        confirmLabel="Olib tashlash"
        danger
      />
    </>
  );
}
