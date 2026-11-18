// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { PublicHeader } from '../../components/layout/public-header.js';
import { ResumeAttemptBanner } from '../../components/student/resume-attempt-banner.js';
import { ConfirmDialog } from '../../components/ui/modal.js';
import { api } from '../../core/api.js';
import { getBrowserKey, hasOpenAttempt, loadAttempt, saveAttempt } from '../../core/attempt-storage.js';
import { view6 } from './view6.js';
export function part1(scope) {
  scope.tryStartAttempt = async () => {
    if (!scope.resolved) return;
    scope.setBusy(true);
    scope.setError('');
    try {
      const existing = loadAttempt();
      if (existing && (await hasOpenAttempt(existing.attemptId || existing.attemptToken))) {
        throw new Error("Test boshqa oynada ochiq. O'sha oynada davom eting yoki uni yoping.");
      }
      if (existing && !scope.confirmOverwrite) {
        scope.setBusy(false);
        scope.setConfirmOverwrite(true);
        return;
      }
      await scope.performStart(existing);
    } catch (err) {
      scope.setError(err instanceof Error ? err.message : "Testni boshlab bo'lmadi.");
      scope.setBusy(false);
    }
  };
  scope.performStart = async (existing = loadAttempt()) => {
    if (!scope.resolved) return;
    scope.setBusy(true);
    scope.setConfirmOverwrite(false);
    try {
      const attempt = await api('school-entry/start', {
        method: 'POST',
        body: JSON.stringify({
          public_school_id: scope.schoolId.trim().toUpperCase(),
          testCode: scope.testCode.trim(),
          classId: scope.classId,
          name: scope.name.trim(),
          surname: scope.surname.trim(),
          browserKey: getBrowserKey(),
        }),
      });
      const same =
        existing &&
        (existing.attemptId === attempt.attemptId || existing.attemptToken === attempt.attemptToken);
      const keepLocal = Boolean(same && existing && existing.draftVersion >= (attempt.draftVersion || 0));
      const nextState = {
        ...(same && existing ? existing : {}),
        ...attempt,
        answers:
          keepLocal && existing
            ? existing.answers
            : attempt.answers || Array(attempt.questions.length).fill(null),
        draftVersion: keepLocal && existing ? existing.draftVersion : attempt.draftVersion || 0,
        dirty: Boolean(keepLocal && existing?.dirty),
        flags: same && existing ? existing.flags : [],
        current: same && existing ? existing.current : 0,
        clockReceivedAt: Date.now(),
      };
      if (!saveAttempt(nextState)) {
        throw new Error("Qurilmada saqlash imkoni yo'q. Brauzer sozlamalarini tekshiring.");
      }
      try {
        if (document.documentElement.requestFullscreen && document.fullscreenEnabled) {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        }
      } catch {
        /* ExamGuard inside TestRunnerPage handles fullscreen gracefully */
      }
      scope.navigate('/test');
    } catch (err) {
      scope.setError(err instanceof Error ? err.message : "Testni boshlab bo'lmadi.");
    } finally {
      scope.setBusy(false);
    }
  };
  scope.chosenClass = scope.resolved?.classes.find((c) => c.id === scope.classId);
  return {
    done: true,
    value: el(
      'div',
      { className: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' },
      el(PublicHeader, { ctaLabel: 'Bosh sahifa', ctaTo: '/' }),
      el(
        'main',
        { className: 'mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6' },
        el(ResumeAttemptBanner, null),
        view6(scope)
      ),
      el(ConfirmDialog, {
        open: scope.confirmOverwrite,
        onClose: () => scope.setConfirmOverwrite(false),
        onConfirm: () => scope.performStart(),
        title: 'Yangi test boshlansinmi?',
        description:
          'Shu qurilmadagi oldingi test javoblari yangi urinish bilan almashtiriladi. Oldingi urinish muddati serverda davom etadi.',
        confirmLabel: 'Yangi testni boshlash',
      })
    ),
  };
}
