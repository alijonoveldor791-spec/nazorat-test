// Egalik tasdiqlangach qoidabuzarlik navbati va imtihon himoyasini ulaydi.
import { effect, reference } from '../../core/state.js';
import { saveAttempt } from '../../core/attempt-storage.js';
import { examGuard } from '../exam-guard.js';
import { violationSync } from '../violation-sync.js';
export function part3(scope) {
  const guard = reference(null);
  scope.enterFullscreen = () => guard.current?.enter();
  effect(() => {
    if (scope.otherTab || !scope.ownershipReady) return;
    const sync = violationSync({
      read: () => (scope.finishedRef.current ? null : scope.stateRef.current),
      update: (next) => {
        scope.stateRef.current = next;
        saveAttempt(next);
        scope.setState(next);
      },
      receive: scope.receiveResult,
      notify: scope.toast,
    });
    scope.violationSyncRef.current = sync;
    return () => {
      sync.stop();
      scope.violationSyncRef.current = null;
    };
  }, [scope.otherTab, scope.ownershipReady]);
  effect(() => {
    if (scope.otherTab || !scope.ownershipReady) return;
    const instance = examGuard({
      live: () => scope.live.current,
      report: (type) => scope.live.current.reportViolation(type),
      finished: () => scope.finishedRef.current,
    });
    guard.current = instance;
    return () => {
      instance.stop();
      guard.current = null;
    };
  }, [scope.otherTab, scope.ownershipReady]);
}
