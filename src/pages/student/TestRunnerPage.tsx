import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  LayoutGrid,
  Maximize2,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { SafeContent } from '../../components/ui/SafeContent';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../lib/api';
import {
  finishAttempt,
  getBrowserKey,
  loadAttempt,
  ownAttemptLock,
  saveAttempt,
} from '../../lib/attemptStorage';
import { formatCountdown } from '../../lib/format';
import type { AttemptState, StoredResult } from '../../types/api';

export function TestRunnerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [state, setState] = useState<AttemptState | null>(() => loadAttempt());
  const [otherTab, setOtherTab] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Tayyor');
  const [errorMsg, setErrorMsg] = useState('');
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [sending, setSending] = useState(false);
  const [mapOpenMobile, setMapOpenMobile] = useState(false);

  const supportsFullscreen =
    typeof document !== 'undefined' &&
    typeof document.documentElement.requestFullscreen === 'function' &&
    Boolean(document.fullscreenEnabled);
  const [guardBlocked, setGuardBlocked] = useState(true);
  const [guardMsg, setGuardMsg] = useState(
    "Test faqat to'liq ekranda ishlanadi. Boshqa oyna yoki ilovaga o'tmang. Qolgan vaqt davom etadi."
  );

  const stateRef = useRef(state);
  stateRef.current = state;
  const finishedRef = useRef(false);
  const armedRef = useRef(false);
  const lastFocusRef = useRef(0);
  const clockOffsetRef = useRef(0);
  const draftTimerRef = useRef<number | undefined>(undefined);
  const draftInFlightRef = useRef(false);
  const submitTimerRef = useRef<number | undefined>(undefined);

  const updateClock = useCallback((serverNow?: string) => {
    if (!serverNow) return;
    const parsed = Date.parse(serverNow);
    if (Number.isFinite(parsed)) {
      clockOffsetRef.current = parsed - Date.now();
    }
  }, []);

  const receiveResult = useCallback(
    (result: StoredResult['result']) => {
      if (finishedRef.current || !stateRef.current) return;
      finishedRef.current = true;
      window.clearTimeout(draftTimerRef.current);
      window.clearTimeout(submitTimerRef.current);
      finishAttempt(result, stateRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      navigate('/natija', { replace: true });
    },
    [navigate]
  );

  const pushDraft = useCallback(async () => {
    const current = stateRef.current;
    if (!current || finishedRef.current || draftInFlightRef.current || !current.dirty || current.pendingSubmit)
      return;
    if (!navigator.onLine) {
      setSaveStatus('Qurilmada saqlandi · oflayn');
      return;
    }
    draftInFlightRef.current = true;
    const version = current.draftVersion;
    const answers = [...current.answers];
    try {
      const response = await api<{ serverNow: string }>('attempts/draft', {
        method: 'POST',
        body: JSON.stringify({
          attemptToken: current.attemptToken,
          browserKey: getBrowserKey(),
          answers,
          version,
        }),
      });
      updateClock(response.serverNow);
      if (stateRef.current && stateRef.current.draftVersion === version) {
        const updated = { ...stateRef.current, dirty: false };
        stateRef.current = updated;
        setState(updated);
        saveAttempt(updated);
        setSaveStatus('Qurilmada va serverda saqlandi');
      }
    } catch (err) {
      setSaveStatus('Qurilmada saqlandi · serverga qayta yuboriladi');
      if (err instanceof ApiError && err.status === 409) {
        try {
          const remote = await api<{ result?: StoredResult['result'] }>('attempts/resume', {
            method: 'POST',
            body: JSON.stringify({ attemptToken: current.attemptToken, browserKey: getBrowserKey() }),
          });
          if (remote.result) receiveResult(remote.result);
        } catch {
          /* ignore */
        }
      } else if (!finishedRef.current) {
        draftTimerRef.current = window.setTimeout(pushDraft, 5000);
      }
    } finally {
      draftInFlightRef.current = false;
    }
  }, [receiveResult, updateClock]);

  const submitFinal = useCallback(
    async (automatic = false) => {
      const current = stateRef.current;
      if (!current || finishedRef.current || sending) return;
      if (!automatic) setConfirmFinish(false);
      window.clearTimeout(draftTimerRef.current);
      const next: AttemptState = { ...current, pendingSubmit: true };
      stateRef.current = next;
      setState(next);
      saveAttempt(next);
      setLocked(true);
      setSending(true);
      setErrorMsg('');
      try {
        const result = await api<StoredResult['result']>('submit', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: next.attemptToken,
            browserKey: getBrowserKey(),
            answers: next.answers,
          }),
        });
        receiveResult(result);
      } catch (err) {
        setErrorMsg(
          (err instanceof Error ? err.message : 'Yuborishda xato') +
            ' · Javoblaringiz qurilmada saqlangan.'
        );
        if (!(err instanceof ApiError) || err.status >= 500 || err.status === 429 || err.status === 0) {
          submitTimerRef.current = window.setTimeout(() => submitFinal(true), 4000);
        }
      } finally {
        setSending(false);
      }
    },
    [receiveResult, sending]
  );

  useEffect(() => {
    const initial = loadAttempt();
    if (!initial) {
      navigate('/test-kirish', { replace: true });
      return;
    }
    let releaseLock: () => void = () => {};
    let cancelled = false;

    ownAttemptLock(initial.attemptId || initial.attemptToken)
      .then(async (release) => {
        if (cancelled) {
          release();
          return;
        }
        releaseLock = release;
        updateClock(initial.serverNow);
        try {
          const remote = await api<{
            result?: StoredResult['result'];
            violationCount?: number;
            deadline: string | null;
            serverNow: string;
            answers: (number | null)[];
            draftVersion: number;
          }>('attempts/resume', {
            method: 'POST',
            body: JSON.stringify({ attemptToken: initial.attemptToken, browserKey: getBrowserKey() }),
          });
          if (cancelled) return;
          if (remote.result) {
            receiveResult(remote.result);
            return;
          }
          updateClock(remote.serverNow);
          const merged: AttemptState = {
            ...initial,
            violationCount: remote.violationCount ?? initial.violationCount ?? 0,
            deadline: remote.deadline,
            serverNow: remote.serverNow,
            clockReceivedAt: Date.now(),
            ...(remote.draftVersion > initial.draftVersion
              ? { answers: remote.answers, draftVersion: remote.draftVersion, dirty: false }
              : {}),
          };
          saveAttempt(merged);
          setState(merged);
          if (merged.pendingSubmit) submitFinal(true);
          else if (merged.dirty) pushDraft();
        } catch (err) {
          if (!cancelled) {
            setErrorMsg(
              (err instanceof Error ? err.message : 'Server bilan aloqa uzildi') +
                ' · Lokal javoblar ochildi.'
            );
          }
        }
      })
      .catch(() => {
        if (!cancelled) setOtherTab(true);
      });

    return () => {
      cancelled = true;
      releaseLock();
      window.clearTimeout(draftTimerRef.current);
      window.clearTimeout(submitTimerRef.current);
    };
  }, [navigate, pushDraft, receiveResult, submitFinal, updateClock]);

  useEffect(() => {
    if (!state?.deadline || otherTab) return;
    const deadlineMs = Date.parse(state.deadline);
    if (!Number.isFinite(deadlineMs)) return;

    const tick = () => {
      const now = Date.now() + clockOffsetRef.current;
      const diff = deadlineMs - now;
      setRemainingMs(Math.max(0, diff));
      if (diff <= 0 && !finishedRef.current) {
        setLocked(true);
        setConfirmFinish(false);
        submitFinal(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [state?.deadline, otherTab, submitFinal]);

  const reportViolation = useCallback(
    async (type: string) => {
      const current = stateRef.current;
      if (!current || finishedRef.current || !armedRef.current) return;
      if (['blur', 'visibility', 'fullscreen'].includes(type)) {
        if (Date.now() - lastFocusRef.current < 1500) return;
        lastFocusRef.current = Date.now();
      }
      try {
        const res = await api<{
          violationCount?: number;
          result?: StoredResult['result'];
        }>('attempts/violations', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: current.attemptToken,
            browserKey: getBrowserKey(),
            type,
          }),
        });
        if (res.result) {
          receiveResult(res.result);
          return;
        }
        if (typeof res.violationCount === 'number' && stateRef.current) {
          const updated = { ...stateRef.current, violationCount: res.violationCount };
          stateRef.current = updated;
          setState(updated);
          saveAttempt(updated);
        }
      } catch {
        /* non-blocking */
      }
    },
    [receiveResult]
  );

  const enterFullscreen = async () => {
    try {
      if (supportsFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
      if (document.hidden || !document.hasFocus()) return;
      if (supportsFullscreen && !document.fullscreenElement) return;
      armedRef.current = true;
      setGuardBlocked(false);
    } catch {
      setGuardMsg("To'liq ekranga ruxsat berilmadi. Brauzer ruxsatini tekshirib, qayta urining.");
    }
  };

  useEffect(() => {
    if (otherTab) return;
    if (!supportsFullscreen || document.fullscreenElement) {
      armedRef.current = true;
      setGuardBlocked(false);
    }

    const prevent = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const pause = (msg?: string) => {
      if (finishedRef.current) return;
      setGuardBlocked(true);
      setConfirmFinish(false);
      if (msg) setGuardMsg(msg);
    };

    const onVisibility = () => {
      if (document.hidden) {
        reportViolation('visibility');
        pause();
      }
    };
    const onBlur = () => {
      reportViolation('blur');
      pause();
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        reportViolation('fullscreen');
        pause();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) &&
          (['p', 's', 'u'].includes(key) || (e.shiftKey && ['i', 'j'].includes(key))))
      ) {
        prevent(e);
        if (!e.repeat) reportViolation('shortcut');
      }
      if (key === 'printscreen') {
        prevent(e);
        reportViolation('printscreen');
        pause("Test savollarini tasvirga olishga ruxsat yo'q. Davom etish uchun testga qayting.");
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!finishedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const onOffline = () => toast('Aloqa uzildi. Yangi javoblar qurilmada saqlanadi.', true);
    const onOnline = () => {
      toast('Aloqa tiklandi. Server holati tekshirilmoqda.');
      if (stateRef.current?.pendingSubmit) submitFinal(true);
      else pushDraft();
    };

    for (const ev of ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart']) {
      document.addEventListener(ev, prevent, { capture: true });
    }
    document.addEventListener('keydown', onKeyDown, { capture: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      for (const ev of ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart']) {
        document.removeEventListener(ev, prevent, { capture: true });
      }
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [otherTab, pushDraft, reportViolation, submitFinal, supportsFullscreen, toast]);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (locked || guardBlocked || !state) return;
      const nextAnswers = [...state.answers];
      nextAnswers[state.current] = optionIndex;
      const next: AttemptState = {
        ...state,
        answers: nextAnswers,
        draftVersion: (state.draftVersion || 0) + 1,
        dirty: true,
      };
      stateRef.current = next;
      setState(next);
      saveAttempt(next);
      setSaveStatus('Saqlanmoqda...');
      window.clearTimeout(draftTimerRef.current);
      draftTimerRef.current = window.setTimeout(pushDraft, 1000);
    },
    [guardBlocked, locked, pushDraft, state]
  );

  const moveQuestion = useCallback(
    (idx: number) => {
      if (!state || guardBlocked || idx < 0 || idx >= state.questions.length) return;
      const next = { ...state, current: idx };
      stateRef.current = next;
      setState(next);
      saveAttempt(next);
    },
    [guardBlocked, state]
  );

  const toggleFlag = useCallback(() => {
    if (!state || locked) return;
    const flags = state.flags.includes(state.current)
      ? state.flags.filter((f) => f !== state.current)
      : [...state.flags, state.current];
    const next = { ...state, flags };
    stateRef.current = next;
    setState(next);
    saveAttempt(next);
  }, [locked, state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!state || guardBlocked || confirmFinish) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' && (e.target as HTMLInputElement).type !== 'radio') return;
      if (tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveQuestion(state.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveQuestion(state.current - 1);
      } else {
        const optionCount = state.questions[state.current]?.options.length || 0;
        const idx = /^[1-6]$/.test(e.key)
          ? Number(e.key) - 1
          : /^[a-f]$/i.test(e.key)
            ? e.key.toUpperCase().charCodeAt(0) - 65
            : -1;
        if (idx >= 0 && idx < optionCount) {
          e.preventDefault();
          selectAnswer(idx);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmFinish, guardBlocked, moveQuestion, selectAnswer, state]);

  const answeredCount = useMemo(
    () => (state ? state.answers.filter((a) => a !== null).length : 0),
    [state]
  );

  if (otherTab) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-600" />
          <h1 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white">
            Test boshqa oynada ochiq
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Avval ochilgan oynada davom eting. O'sha oynani yopib, bu sahifani yangilang.
          </p>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const question = state.questions[state.current];
  const isFlagged = state.flags.includes(state.current);
  const unansweredCount = state.questions.length - answeredCount;
  const urgentTimer = remainingMs !== null && remainingMs <= 120000;

  return (
    <div className="exam-protected min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="exam-watermark" aria-hidden="true">
        {state.identity.surname} {state.identity.name} · {state.identity.studentId || state.attemptId}
      </div>

      {guardBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 text-white backdrop-blur-sm">
          <div className="max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-blue-400" />
            <h2 className="font-display text-xl font-bold">Imtihon rejimi</h2>
            <p className="text-sm leading-relaxed text-slate-300">{guardMsg}</p>
            <button
              type="button"
              onClick={enterFullscreen}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Testga qaytish</span>
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              {state.title}
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {state.identity.surname} {state.identity.name} · {state.identity.grade} · {saveStatus}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {remainingMs !== null && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
                  urgentTimer
                    ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300'
                    : 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{formatCountdown(remainingMs)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMapOpenMobile((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium lg:hidden dark:border-slate-700"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {answeredCount}/{state.questions.length}
              </span>
            </button>

            <button
              type="button"
              disabled={locked && !state.pendingSubmit}
              onClick={() => (state.pendingSubmit ? submitFinal(true) : setConfirmFinish(true))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{state.pendingSubmit ? 'Qayta yuborish' : 'Yakunlash'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-8">
          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
            >
              {errorMsg}
            </div>
          )}

          {question && (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <span className="font-mono text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    Savol {state.current + 1} / {state.questions.length}
                  </span>
                  {question.section && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      · {question.section.type} · {question.section.subject}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={locked}
                  onClick={toggleFlag}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isFlagged
                      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>{isFlagged ? 'Belgilangan' : 'Keyinroq qaytaman'}</span>
                </button>
              </div>

              <div className="mt-6 text-base leading-relaxed font-medium text-slate-900 sm:text-lg dark:text-slate-100">
                <SafeContent value={question.q} format={question.contentFormat} />
              </div>

              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Javob variantlari">
                {question.options.map((opt, idx) => {
                  const selected = state.answers[state.current] === idx;
                  const letter = 'ABCDEF'[idx] || String(idx + 1);
                  return (
                    <label
                      key={idx}
                      className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors ${
                        selected
                          ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700'
                      } ${locked ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q-${state.current}`}
                        value={idx}
                        checked={selected}
                        disabled={locked}
                        onChange={() => selectAnswer(idx)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                          selected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {letter}
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-slate-800 sm:text-base dark:text-slate-200">
                        <SafeContent value={opt} format={question.contentFormat} />
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  disabled={locked || state.current === 0}
                  onClick={() => moveQuestion(state.current - 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Oldingi</span>
                </button>

                {state.current === state.questions.length - 1 ? (
                  <button
                    type="button"
                    disabled={locked && !state.pendingSubmit}
                    onClick={() =>
                      state.pendingSubmit ? submitFinal(true) : setConfirmFinish(true)
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <span>Yakunlash va yuborish</span>
                    <Send className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => moveQuestion(state.current + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <span>Keyingi</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          )}
        </section>

        <aside
          className={`lg:col-span-4 ${mapOpenMobile ? 'block' : 'hidden lg:block'}`}
          aria-label="Savollar xaritasi"
        >
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Savollar xaritasi
              </h2>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {answeredCount} / {state.questions.length}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
              {state.questions.map((_, idx) => {
                const isCurrent = state.current === idx;
                const isAnswered = state.answers[idx] !== null;
                const flagged = state.flags.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      moveQuestion(idx);
                      setMapOpenMobile(false);
                    }}
                    className={`relative flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-semibold tabular-nums transition-colors ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isAnswered
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                    {flagged && (
                      <span
                        className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                        aria-label="Belgilangan"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-1.5 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <p>Klaviatura: 1–6 yoki A–F variant, ← / → savol</p>
              {typeof state.violationCount === 'number' && state.violationCount > 0 && (
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  Qoidabuzarlik qayd etilgan: {state.violationCount}
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>

      <ConfirmDialog
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        onConfirm={() => submitFinal(false)}
        title="Test yakunlansinmi?"
        description={
          unansweredCount > 0
            ? `${unansweredCount} ta savol javobsiz qolgan. Baribir yakunlab yuborilsinmi?`
            : 'Barcha javoblar tayyor. Natijani yuborasizmi?'
        }
        confirmLabel="Yakunlash"
        cancelLabel="Testga qaytish"
        loading={sending}
      />
    </div>
  );
}
