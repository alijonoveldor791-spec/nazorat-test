// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { effect as useEffect } from '../../core/state.js';
export function part3(scope) {
  scope.enterFullscreen = async () => {
    try {
      if (scope.supportsFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
      if (document.hidden || !document.hasFocus()) return;
      if (scope.supportsFullscreen && !document.fullscreenElement) return;
      scope.armedRef.current = true;
      scope.setGuardBlocked(false);
    } catch {
      scope.setGuardMsg("To'liq ekranga ruxsat berilmadi. Brauzer ruxsatini tekshirib, qayta urining.");
    }
  };
  useEffect(() => {
    if (scope.otherTab) return;
    if (!scope.supportsFullscreen || document.fullscreenElement) {
      scope.armedRef.current = true;
      scope.setGuardBlocked(false);
    }
    const prevent = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const pause = (msg) => {
      if (scope.finishedRef.current) return;
      scope.setGuardBlocked(true);
      scope.setConfirmFinish(false);
      if (msg) scope.setGuardMsg(msg);
    };
    const onVisibility = () => {
      if (document.hidden) {
        scope.reportViolation('visibility');
        pause();
      }
    };
    const onBlur = () => {
      scope.reportViolation('blur');
      pause();
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        scope.reportViolation('fullscreen');
        pause();
      }
    };
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) &&
          (['p', 's', 'u'].includes(key) || (e.shiftKey && ['i', 'j'].includes(key))))
      ) {
        prevent(e);
        if (!e.repeat) scope.reportViolation('shortcut');
      }
      if (key === 'printscreen') {
        prevent(e);
        scope.reportViolation('printscreen');
        pause("Test savollarini tasvirga olishga ruxsat yo'q. Davom etish uchun testga qayting.");
      }
    };
    const onBeforeUnload = (e) => {
      if (!scope.finishedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const onOffline = () => scope.toast('Aloqa uzildi. Yangi javoblar qurilmada saqlanadi.', true);
    const onOnline = () => {
      scope.toast('Aloqa tiklandi. Server holati tekshirilmoqda.');
      if (scope.stateRef.current?.pendingSubmit) scope.submitFinal(true);
      else scope.pushDraft();
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
  }, [
    scope.otherTab,
    scope.pushDraft,
    scope.reportViolation,
    scope.submitFinal,
    scope.supportsFullscreen,
    scope.toast,
  ]);
}
