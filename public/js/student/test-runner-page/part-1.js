// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback } from '../../core/state.js';
import { api, ApiError } from '../../core/api.js';
import { getBrowserKey, saveAttempt } from '../../core/attempt-storage.js';
export function part1(scope) {
  scope.pushDraft = useCallback(async () => {
    const current = scope.stateRef.current;
    if (
      !current ||
      scope.finishedRef.current ||
      scope.draftInFlightRef.current ||
      !current.dirty ||
      current.pendingSubmit
    )
      return;
    if (!navigator.onLine) {
      scope.setSaveStatus('Qurilmada saqlandi · oflayn');
      return;
    }
    scope.draftInFlightRef.current = true;
    const version = current.draftVersion;
    const answers = [...current.answers];
    try {
      const response = await api('attempts/draft', {
        method: 'POST',
        body: JSON.stringify({
          attemptToken: current.attemptToken,
          browserKey: getBrowserKey(),
          answers,
          version,
        }),
      });
      scope.updateClock(response.serverNow);
      if (scope.stateRef.current && scope.stateRef.current.draftVersion === version) {
        const updated = { ...scope.stateRef.current, dirty: false };
        scope.stateRef.current = updated;
        scope.setState(updated);
        saveAttempt(updated);
        scope.setSaveStatus('Qurilmada va serverda saqlandi');
      }
    } catch (err) {
      scope.setSaveStatus('Qurilmada saqlandi · serverga qayta yuboriladi');
      if (err instanceof ApiError && err.status === 409) {
        try {
          const remote = await api('attempts/resume', {
            method: 'POST',
            body: JSON.stringify({ attemptToken: current.attemptToken, browserKey: getBrowserKey() }),
          });
          if (remote.result) scope.receiveResult(remote.result);
        } catch {
          /* ignore */
        }
      } else if (!scope.finishedRef.current) {
        scope.draftTimerRef.current = window.setTimeout(scope.pushDraft, 5000);
      }
    } finally {
      scope.draftInFlightRef.current = false;
    }
  }, [scope.receiveResult, scope.updateClock]);
  scope.submitFinal = useCallback(
    async (automatic = false) => {
      const current = scope.stateRef.current;
      if (!current || scope.finishedRef.current || scope.sending) return;
      if (!automatic) scope.setConfirmFinish(false);
      window.clearTimeout(scope.draftTimerRef.current);
      const next = { ...current, pendingSubmit: true };
      scope.stateRef.current = next;
      scope.setState(next);
      saveAttempt(next);
      scope.setLocked(true);
      scope.setSending(true);
      scope.setErrorMsg('');
      try {
        if (scope.stateRef.current?.violationQueue?.length) {
          await scope.violationSyncRef.current?.flush();
          if (scope.finishedRef.current) return;
          if (scope.stateRef.current?.violationQueue?.length)
            throw new ApiError(
              'Himoya xabarlari hali yuborilmadi. Aloqa tiklanganda test qayta yuboriladi.',
              0
            );
        }
        const result = await api('submit', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: next.attemptToken,
            browserKey: getBrowserKey(),
            answers: next.answers,
          }),
        });
        scope.receiveResult(result);
      } catch (err) {
        scope.setErrorMsg(
          (err instanceof Error ? err.message : 'Yuborishda xato') + ' · Javoblaringiz qurilmada saqlangan.'
        );
        if (!(err instanceof ApiError) || err.status >= 500 || err.status === 429 || err.status === 0) {
          scope.submitTimerRef.current = window.setTimeout(() => scope.submitFinal(true), 4000);
        }
      } finally {
        scope.setSending(false);
      }
    },
    [scope.receiveResult, scope.sending]
  );
}
