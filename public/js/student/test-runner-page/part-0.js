// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback, reference as useRef, state as useState } from '../../core/state.js';
import { useNavigate } from '../../core/navigation.js';
import { useToast } from '../../components/toast-context.js';
import { finishAttempt, loadAttempt } from '../../core/attempt-storage.js';
import { useTheme } from '../../components/theme-context.js';
export function part0(scope) {
  scope.navigate = useNavigate();
  ({ toast: scope.toast } = useToast());
  ({ theme: scope.theme, toggleTheme: scope.toggleTheme } = useTheme());
  [scope.state, scope.setState] = useState(() => loadAttempt());
  [scope.otherTab, scope.setOtherTab] = useState(false);
  [scope.saveStatus, scope.setSaveStatus] = useState('Tayyor');
  [scope.errorMsg, scope.setErrorMsg] = useState('');
  [scope.remainingMs, scope.setRemainingMs] = useState(null);
  [scope.locked, scope.setLocked] = useState(false);
  [scope.confirmFinish, scope.setConfirmFinish] = useState(false);
  [scope.sending, scope.setSending] = useState(false);
  [scope.mapOpenMobile, scope.setMapOpenMobile] = useState(false);
  [scope.ownershipReady, scope.setOwnershipReady] = useState(false);
  [scope.openSection, scope.setOpenSection] = useState(
    () => scope.state?.questions[scope.state.current]?.section?.id || null
  );
  [scope.openCategory, scope.setOpenCategory] = useState(() =>
    /majburiy/i.test(scope.state?.questions[scope.state.current]?.section?.type || '') ? 'required' : 'main'
  );
  scope.live = useRef(scope);
  scope.live.current = scope;
  scope.violationSyncRef = useRef(null);
  scope.supportsFullscreen =
    typeof document !== 'undefined' &&
    typeof document.documentElement.requestFullscreen === 'function' &&
    Boolean(document.fullscreenEnabled);
  [scope.guardBlocked, scope.setGuardBlocked] = useState(true);
  [scope.guardMsg, scope.setGuardMsg] = useState(
    "Test faqat to'liq ekranda ishlanadi. Boshqa oyna yoki ilovaga o'tmang. Qolgan vaqt davom etadi."
  );
  scope.stateRef = useRef(scope.state);
  scope.stateRef.current = scope.state;
  scope.finishedRef = useRef(false);
  scope.armedRef = useRef(false);
  scope.lastFocusRef = useRef(0);
  scope.clockOffsetRef = useRef(0);
  scope.draftTimerRef = useRef(undefined);
  scope.draftInFlightRef = useRef(false);
  scope.submitTimerRef = useRef(undefined);
  scope.updateClock = useCallback((serverNow) => {
    if (!serverNow) return;
    const parsed = Date.parse(serverNow);
    if (Number.isFinite(parsed)) {
      scope.clockOffsetRef.current = parsed - Date.now();
    }
  }, []);
  scope.receiveResult = useCallback(
    (result) => {
      if (scope.finishedRef.current || !scope.stateRef.current) return;
      scope.finishedRef.current = true;
      scope.violationSyncRef.current?.stop();
      window.clearTimeout(scope.draftTimerRef.current);
      window.clearTimeout(scope.submitTimerRef.current);
      finishAttempt(result, scope.stateRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      scope.navigate('/natija', { replace: true });
    },
    [scope.navigate]
  );
}
