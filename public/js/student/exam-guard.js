// Test davomida to'liq ekran, sahifa fokusi va ichki navigatsiyani nazorat qiladi.
export function examGuard({ autoEnter = false, report = () => {} } = {}) {
  let armed = false,
    lastFocus = 0;
  const record = (type) => {
    if (!armed || !active) return;
    if (['blur', 'visibility', 'fullscreen'].includes(type)) {
      if (Date.now() - lastFocus < 1500) return;
      lastFocus = Date.now();
    }
    report(type);
  };
  const panel = document.getElementById('exam-guard');
  const button = document.getElementById('exam-guard-enter');
  const message = document.getElementById('exam-guard-message');
  const regions = [document.querySelector('main'), document.getElementById('student-header')];
  const events = new AbortController();
  const options = { signal: events.signal };
  const capture = { ...options, capture: true };
  document.body.classList.add('exam-protected');
  const prevent = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  for (const name of ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'])
    document.addEventListener(name, prevent, capture);
  const captureShortcut = (event) => {
    const key = /^Digit[345]$/.test(event.code) ? event.code.slice(-1) : event.key.toLowerCase();
    if (
      key === 'printscreen' ||
      (event.metaKey && event.shiftKey && ['3', '4', '5', 's'].includes(key)) ||
      (event.ctrlKey && event.shiftKey && key === 's')
    ) {
      prevent(event);
      if (event.type === 'keyup' && key === 'printscreen') {
        record('printscreen');
        navigator.clipboard?.writeText('').catch(() => {});
      }
      pause();
      message.textContent =
        "Test savollarini tasvirga olishga ruxsat yo'q. Davom etish uchun testga qayting. Vaqt davom etadi.";
    }
  };
  document.addEventListener(
    'keydown',
    (event) => {
      const key = event.key.toLowerCase();
      if (
        key === 'f12' ||
        ((event.ctrlKey || event.metaKey) &&
          (['p', 's', 'u'].includes(key) || (event.shiftKey && ['i', 'j'].includes(key))))
      ) {
        prevent(event);
        if (!event.repeat) record('shortcut');
      }
    },
    capture
  );
  document.addEventListener('keydown', captureShortcut, capture);
  document.addEventListener('keyup', captureShortcut, capture);
  window.addEventListener('beforeprint', pause, options);
  const supportsFullscreen = !!document.documentElement.requestFullscreen && document.fullscreenEnabled;
  let active = true;
  let blocked = true;
  function pause() {
    if (!active) return;
    blocked = true;
    document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
    regions.forEach((region) => (region.inert = true));
    panel.hidden = false;
    message.textContent = supportsFullscreen
      ? "Test faqat to'liq ekranda ishlanadi. Boshqa oyna yoki ilovaga o'tmang. Qolgan vaqt davom etadi."
      : "Bu brauzer to'liq ekran rejimini qo'llamaydi. Boshqa oyna yoki ilovaga o'tmang. Qolgan vaqt davom etadi.";
    button.focus();
  }
  async function enter() {
    button.disabled = true;
    try {
      if (supportsFullscreen && !document.fullscreenElement)
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      if (!active || document.hidden || !document.hasFocus()) return;
      if (supportsFullscreen && !document.fullscreenElement) return;
      armed = true;
      blocked = false;
      panel.hidden = true;
      regions.forEach((region) => (region.inert = false));
      document.getElementById('question-title').focus();
    } catch {
      message.textContent = "To'liq ekranga ruxsat berilmadi. Brauzer ruxsatini tekshirib, qayta urining.";
    } finally {
      button.disabled = false;
    }
  }
  button.addEventListener('click', enter, options);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        record('visibility');
        pause();
      }
    },
    options
  );
  window.addEventListener(
    'blur',
    () => {
      record('blur');
      pause();
    },
    options
  );
  window.addEventListener('pageshow', pause, options);
  document.addEventListener(
    'fullscreenchange',
    () => {
      if (!document.fullscreenElement) {
        record('fullscreen');
        pause();
      }
    },
    options
  );
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href]');
      if (link && link.getAttribute('href') !== '#main') {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    { ...options, capture: true }
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (blocked) {
        if (!event.target.closest('#exam-guard')) event.preventDefault();
        event.stopImmediatePropagation();
      } else if (
        (event.ctrlKey || event.metaKey) &&
        ['a', 'c', 'x', 's', 'l', 't', 'n', 'w', 'r', 'p', 'f', 'k', 'insert'].includes(
          event.key.toLowerCase()
        )
      ) {
        event.preventDefault();
      } else if (event.altKey && ['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) {
        event.preventDefault();
      }
    },
    { ...options, capture: true }
  );
  window.addEventListener(
    'beforeunload',
    (event) => {
      event.preventDefault();
      event.returnValue = '';
    },
    options
  );
  pause();
  if (autoEnter && (!supportsFullscreen || document.fullscreenElement)) enter();
  return {
    isBlocked: () => blocked,
    stop() {
      active = false;
      armed = true;
      blocked = false;
      events.abort();
      document.body.classList.remove('exam-protected');
      panel.hidden = true;
      regions.forEach((region) => (region.inert = false));
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    },
  };
}
