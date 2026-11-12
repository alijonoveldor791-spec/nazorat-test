// Test davomida to'liq ekran, sahifa fokusi va ichki navigatsiyani nazorat qiladi.
export function examGuard() {
  const panel = document.getElementById('exam-guard');
  const button = document.getElementById('exam-guard-enter');
  const message = document.getElementById('exam-guard-message');
  const regions = [document.querySelector('main'), document.getElementById('student-header')];
  const events = new AbortController();
  const options = { signal: events.signal };
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
  document.addEventListener('visibilitychange', () => document.hidden && pause(), options);
  window.addEventListener('blur', pause, options);
  window.addEventListener('pageshow', pause, options);
  document.addEventListener(
    'fullscreenchange',
    () => {
      if (!document.fullscreenElement) pause();
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
        ['l', 't', 'n', 'w', 'r', 'p', 'f', 'k'].includes(event.key.toLowerCase())
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
  return {
    isBlocked: () => blocked,
    stop() {
      active = false;
      blocked = false;
      events.abort();
      panel.hidden = true;
      regions.forEach((region) => (region.inert = false));
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    },
  };
}
