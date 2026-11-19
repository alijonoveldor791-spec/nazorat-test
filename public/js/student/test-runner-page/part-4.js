// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { callback as useCallback, effect as useEffect, memo as useMemo } from '../../core/state.js';
import { AlertTriangle } from '../../components/icons.js';
import { saveAttempt } from '../../core/attempt-storage.js';
import { view8 } from './view8.js';
import { LoadingState } from '../../components/ui/loading-state.js';
export function part4(scope) {
  useEffect(() => {
    const section = scope.state?.questions[scope.state.current]?.section;
    scope.setOpenSection(section?.id || null);
    scope.setOpenCategory(section ? (/majburiy/i.test(section.type) ? 'required' : 'main') : 'general');
  }, [scope.state?.current]);
  scope.selectAnswer = useCallback(
    (optionIndex) => {
      if (scope.locked || scope.guardBlocked || !scope.state) return;
      const nextAnswers = [...scope.state.answers];
      nextAnswers[scope.state.current] = optionIndex;
      const next = {
        ...scope.state,
        answers: nextAnswers,
        draftVersion: (scope.state.draftVersion || 0) + 1,
        dirty: true,
      };
      scope.stateRef.current = next;
      scope.setState(next);
      saveAttempt(next);
      scope.setSaveStatus('Saqlanmoqda...');
      window.clearTimeout(scope.draftTimerRef.current);
      scope.draftTimerRef.current = window.setTimeout(scope.pushDraft, 1000);
    },
    [scope.guardBlocked, scope.locked, scope.pushDraft, scope.state]
  );
  scope.moveQuestion = useCallback(
    (idx) => {
      if (!scope.state || scope.guardBlocked || idx < 0 || idx >= scope.state.questions.length) return;
      const next = { ...scope.state, current: idx };
      scope.stateRef.current = next;
      scope.setState(next);
      saveAttempt(next);
    },
    [scope.guardBlocked, scope.state]
  );
  scope.toggleFlag = useCallback(() => {
    if (!scope.state || scope.locked) return;
    const flags = scope.state.flags.includes(scope.state.current)
      ? scope.state.flags.filter((f) => f !== scope.state.current)
      : [...scope.state.flags, scope.state.current];
    const next = { ...scope.state, flags };
    scope.stateRef.current = next;
    scope.setState(next);
    saveAttempt(next);
  }, [scope.locked, scope.state]);
  useEffect(() => {
    const onKey = (e) => {
      if (!scope.state || scope.guardBlocked || scope.confirmFinish) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' && e.target.type !== 'radio') return;
      if (tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scope.moveQuestion(scope.state.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scope.moveQuestion(scope.state.current - 1);
      } else {
        const optionCount = scope.state.questions[scope.state.current]?.options.length || 0;
        const idx = /^[1-6]$/.test(e.key)
          ? Number(e.key) - 1
          : /^[a-f]$/i.test(e.key)
            ? e.key.toUpperCase().charCodeAt(0) - 65
            : -1;
        if (idx >= 0 && idx < optionCount) {
          e.preventDefault();
          scope.selectAnswer(idx);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [scope.confirmFinish, scope.guardBlocked, scope.moveQuestion, scope.selectAnswer, scope.state]);
  scope.answeredCount = useMemo(
    () => (scope.state ? scope.state.answers.filter((a) => a !== null).length : 0),
    [scope.state]
  );
  if (scope.otherTab) {
    return {
      done: true,
      value: el(
        'div',
        { className: 'flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950' },
        el(
          'div',
          {
            className:
              'max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900',
          },
          el(AlertTriangle, { className: 'mx-auto h-8 w-8 text-amber-600' }),
          el(
            'h1',
            { className: 'mt-3 font-display text-xl font-bold text-slate-900 dark:text-white' },
            'Test boshqa oynada ochiq'
          ),
          el(
            'p',
            { className: 'mt-2 text-sm text-slate-600 dark:text-slate-300' },
            "Avval ochilgan oynada davom eting. O'sha oynani yopib, bu sahifani yangilang."
          )
        )
      ),
    };
  }
  if (!scope.state) return { done: true, value: null };
  if (!scope.ownershipReady)
    return { done: true, value: el(LoadingState, { label: 'Urinish tekshirilmoqda...' }) };
  scope.question = scope.state.questions[scope.state.current];
  scope.activeSubject = scope.question.section?.subject || scope.state.subject || '';
  scope.isFlagged = scope.state.flags.includes(scope.state.current);
  scope.unansweredCount = scope.state.questions.length - scope.answeredCount;
  scope.urgentTimer = scope.remainingMs !== null && scope.remainingMs <= 120000;
  return { done: true, value: view8(scope) };
}
