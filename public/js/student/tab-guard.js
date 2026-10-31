// Bitta urinishni ikki oynada bir vaqtda tahrirlashdan saqlaydi.
export async function ownAttempt(key) {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) location.reload();
  });
  if (navigator.locks) {
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    return new Promise((resolve) => {
      navigator.locks
        .request('nazorat-' + key, { ifAvailable: true }, async (lock) => {
          resolve(Boolean(lock));
          if (lock) {
            window.addEventListener('pagehide', release, { once: true });
            await held;
          }
        })
        .catch(() => resolve(false));
    });
  }
  const id = crypto.randomUUID(),
    name = 'nazorat-lease-' + key;
  try {
    const current = JSON.parse(localStorage.getItem(name));
    if (current && current.until > Date.now()) return false;
    const renew = () => localStorage.setItem(name, JSON.stringify({ id, until: Date.now() + 6000 }));
    renew();
    const interval = setInterval(renew, 2000);
    window.addEventListener(
      'pagehide',
      () => {
        clearInterval(interval);
        if (JSON.parse(localStorage.getItem(name))?.id === id) localStorage.removeItem(name);
      },
      { once: true }
    );
    return true;
  } catch {
    return false;
  }
}
export async function hasOpenAttempt(key) {
  if (navigator.locks) {
    const state = await navigator.locks.query();
    return state.held.some((lock) => lock.name === 'nazorat-' + key);
  }
  try {
    return JSON.parse(localStorage.getItem('nazorat-lease-' + key))?.until > Date.now();
  } catch {
    return false;
  }
}
