// Imtihonda fokus, to'liq ekran, nusxalash va aniqlanadigan tasvirga olish urinishlarini nazorat qiladi.
export function examGuard({ live, report, finished }) {
  const events = new AbortController();
  const capture = { capture: true, signal: events.signal };
  const normal = { signal: events.signal };
  const pressed = new Set();
  let active = true;
  document.body.classList.add('exam-running');
  const prevent = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  function pause(message) {
    if (!active || finished()) return;
    document.documentElement.classList.add('exam-hidden');
    live().setGuardBlocked(true);
    live().setConfirmFinish(false);
    if (message) live().setGuardMsg(message);
    requestAnimationFrame(() => document.getElementById('exam-guard-enter')?.focus());
  }
  async function enter() {
    try {
      if (live().supportsFullscreen && !document.fullscreenElement)
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      if (!active || document.hidden || !document.hasFocus()) return;
      if (live().supportsFullscreen && !document.fullscreenElement) return;
      live().armedRef.current = true;
      document.documentElement.classList.remove('exam-hidden');
      live().setGuardBlocked(false);
      requestAnimationFrame(() => document.getElementById('question-title')?.focus());
    } catch {
      pause("To'liq ekranga ruxsat berilmadi. Brauzer ruxsatini tekshirib, qayta urining.");
    }
  }
  const screenshot = (event) => {
    const key = /^Digit[345]$/.test(event.code) ? event.code.slice(-1) : event.key.toLowerCase();
    return (
      key === 'printscreen' ||
      (event.metaKey && event.shiftKey && ['3', '4', '5', 's'].includes(key)) ||
      (event.ctrlKey && event.shiftKey && key === 's')
    );
  };
  const keyboard = (event) => {
    const key = event.key.toLowerCase();
    if (screenshot(event)) {
      prevent(event);
      pause('Skrinshotga urinish qayd etildi. Testga qayting. Qolgan vaqt davom etadi.');
      const code = event.code || key;
      if (!event.repeat && !pressed.has(code)) {
        report('printscreen');
      }
      if (event.type === 'keydown') {
        pressed.add(code);
      }
      if (event.type === 'keyup') pressed.delete(code);
      return;
    }
    if (event.type === 'keyup') pressed.delete(event.code || key);
    if (event.type !== 'keydown') return;
    if (key === 'meta') {
      pause('Tizim tugmasi bosildi. Testga qayting. Qolgan vaqt davom etadi.');
      return;
    }
    if (live().guardBlocked && !event.target.closest?.('[data-exam-guard]')) {
      prevent(event);
      return;
    }
    const command = event.ctrlKey || event.metaKey;
    if (
      key === 'f12' ||
      (command &&
        (['c', 'x', 'p', 's', 'u', 'insert'].includes(key) || (event.shiftKey && ['i', 'j'].includes(key))))
    ) {
      prevent(event);
      if (!event.repeat) report('shortcut');
    } else if (
      (command && ['a', 'l', 't', 'n', 'w', 'r', 'f', 'k'].includes(key)) ||
      (event.altKey && ['arrowleft', 'arrowright', 'home'].includes(key))
    )
      prevent(event);
  };
  for (const name of ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'])
    document.addEventListener(name, prevent, capture);
  document.addEventListener('keydown', keyboard, capture);
  document.addEventListener('keyup', keyboard, capture);
  document.addEventListener(
    'click',
    (event) => {
      if (event.target.closest?.('a[href]')) prevent(event);
    },
    capture
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        report('visibility');
        pause();
      }
    },
    normal
  );
  window.addEventListener(
    'blur',
    () => {
      report('blur');
      pause();
    },
    normal
  );
  document.addEventListener(
    'fullscreenchange',
    () => {
      if (!document.fullscreenElement) {
        report('fullscreen');
        pause();
      }
    },
    normal
  );
  window.addEventListener('beforeprint', () => pause("Test savollarini chop etishga ruxsat yo'q."), normal);
  window.addEventListener('pageshow', () => pause(), normal);
  window.addEventListener(
    'beforeunload',
    (event) => {
      if (!finished()) {
        event.preventDefault();
        event.returnValue = '';
      }
    },
    normal
  );
  window.addEventListener(
    'offline',
    () => live().toast('Aloqa uzildi. Javoblar va himoya xabarlari qurilmada saqlanadi.', true),
    normal
  );
  window.addEventListener(
    'online',
    () => {
      live().violationSyncRef.current?.flush();
      if (live().stateRef.current?.pendingSubmit) live().submitFinal(true);
      else live().pushDraft();
    },
    normal
  );
  if (!live().supportsFullscreen || document.fullscreenElement) {
    live().armedRef.current = true;
    document.documentElement.classList.remove('exam-hidden');
    live().setGuardBlocked(false);
  } else pause();
  return {
    enter,
    stop() {
      active = false;
      events.abort();
      pressed.clear();
      document.body.classList.remove('exam-running');
      document.documentElement.classList.remove('exam-hidden');
    },
  };
}
