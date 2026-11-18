// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback, effect as useEffect } from '../../core/state.js';
import { api } from '../../core/api.js';
import { getBrowserKey, loadAttempt, ownAttemptLock, saveAttempt } from '../../core/attempt-storage.js';
export function part2(scope) {
  useEffect(() => {
    const initial = loadAttempt();
    if (!initial) {
      scope.navigate('/test-kirish', { replace: true });
      return;
    }
    let releaseLock = () => {};
    let cancelled = false;
    ownAttemptLock(initial.attemptId || initial.attemptToken)
      .then(async (release) => {
        if (cancelled) {
          release();
          return;
        }
        releaseLock = release;
        scope.updateClock(initial.serverNow);
        try {
          const remote = await api('attempts/resume', {
            method: 'POST',
            body: JSON.stringify({ attemptToken: initial.attemptToken, browserKey: getBrowserKey() }),
          });
          if (cancelled) return;
          if (remote.result) {
            scope.receiveResult(remote.result);
            return;
          }
          scope.updateClock(remote.serverNow);
          const merged = {
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
          scope.setState(merged);
          if (merged.pendingSubmit) scope.submitFinal(true);
          else if (merged.dirty) scope.pushDraft();
        } catch (err) {
          if (!cancelled) {
            scope.setErrorMsg(
              (err instanceof Error ? err.message : 'Server bilan aloqa uzildi') +
                ' · Lokal javoblar ochildi.'
            );
          }
        }
      })
      .catch(() => {
        if (!cancelled) scope.setOtherTab(true);
      });
    return () => {
      cancelled = true;
      releaseLock();
      window.clearTimeout(scope.draftTimerRef.current);
      window.clearTimeout(scope.submitTimerRef.current);
    };
  }, [scope.navigate, scope.pushDraft, scope.receiveResult, scope.submitFinal, scope.updateClock]);
  useEffect(() => {
    if (!scope.state?.deadline || scope.otherTab) return;
    const deadlineMs = Date.parse(scope.state.deadline);
    if (!Number.isFinite(deadlineMs)) return;
    const tick = () => {
      const now = Date.now() + scope.clockOffsetRef.current;
      const diff = deadlineMs - now;
      scope.setRemainingMs(Math.max(0, diff));
      if (diff <= 0 && !scope.finishedRef.current) {
        scope.setLocked(true);
        scope.setConfirmFinish(false);
        scope.submitFinal(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [scope.state?.deadline, scope.otherTab, scope.submitFinal]);
  scope.reportViolation = useCallback(
    async (type) => {
      const current = scope.stateRef.current;
      if (!current || scope.finishedRef.current || !scope.armedRef.current) return;
      if (['blur', 'visibility', 'fullscreen'].includes(type)) {
        if (Date.now() - scope.lastFocusRef.current < 1500) return;
        scope.lastFocusRef.current = Date.now();
      }
      try {
        const res = await api('attempts/violations', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: current.attemptToken,
            browserKey: getBrowserKey(),
            type,
          }),
        });
        if (res.result) {
          scope.receiveResult(res.result);
          return;
        }
        if (typeof res.violationCount === 'number' && scope.stateRef.current) {
          const updated = { ...scope.stateRef.current, violationCount: res.violationCount };
          scope.stateRef.current = updated;
          scope.setState(updated);
          saveAttempt(updated);
        }
      } catch {
        /* non-blocking */
      }
    },
    [scope.receiveResult]
  );
}
