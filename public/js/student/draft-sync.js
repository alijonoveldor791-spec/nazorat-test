// Javoblarni tartib raqami bilan serverga yuboradi; lokal nusxa doim saqlanadi.
import { api } from '../core/api-client.js';
import { browserKey, saveAttempt } from './test-state.js';
export function draftSync(state, onClock, onResult) {
  let timer,
    running = false,
    stopped = false,
    localSaved = true,
    failures = 0,
    retryAt = 0;
  function schedulePush(delay) {
    clearTimeout(timer);
    timer = setTimeout(push, Math.max(delay, retryAt - Date.now(), 0));
  }
  function persist() {
    localSaved = saveAttempt(state);
    return localSaved;
  }
  const status = (text) => {
    const node = document.getElementById('save-status');
    if (node) node.textContent = text;
  };
  async function push() {
    if (stopped || running || !state.dirty || state.pendingSubmit) return;
    if (Date.now() < retryAt) return schedulePush(0);
    if (!navigator.onLine) {
      status(
        localSaved
          ? 'Qurilmada saqlandi · serverga hali yuborilmadi'
          : 'Qurilmaga joy yetmadi. Javoblar faqat xotirada; sahifani yopmang.'
      );
      return;
    }
    running = true;
    const version = state.draftVersion,
      answers = [...state.answers];
    try {
      const response = await api('attempts/draft', {
        method: 'POST',
        body: JSON.stringify({
          attemptToken: state.attemptToken,
          browserKey: browserKey(),
          answers,
          version,
        }),
      });
      failures = 0;
      retryAt = 0;
      onClock(response.serverNow);
      if (state.draftVersion === version) {
        state.dirty = false;
        persist();
        status(localSaved ? '✓ Qurilmada va serverda saqlandi' : 'Serverda saqlandi · qurilmaga joy yetmadi');
      }
    } catch (error) {
      const delay = Math.min(30000, 5000 * 2 ** Math.min(failures++, 3));
      retryAt =
        Date.now() + Math.max(delay + Math.floor(Math.random() * 1001), (error.retryAfter || 0) * 1000);
      if (!stopped)
        status(
          localSaved
            ? 'Qurilmada saqlandi · server tasdiqlamadi'
            : 'Saqlash tasdiqlanmadi. Javoblar xotirada; sahifani yopmang.'
        );
      if (error.status === 409)
        try {
          const r = await api('attempts/resume', {
            method: 'POST',
            body: JSON.stringify({ attemptToken: state.attemptToken, browserKey: browserKey() }),
          });
          if (r.result) onResult(r.result);
        } catch {}
    } finally {
      running = false;
      if (!stopped && state.dirty && !state.pendingSubmit) schedulePush(failures ? 0 : 1200);
    }
  }
  return {
    changed() {
      state.draftVersion = (state.draftVersion || 0) + 1;
      state.dirty = true;
      persist();
      status(
        localSaved
          ? 'Qurilmada saqlandi · serverga yuborilmoqda'
          : 'Qurilmaga joy yetmadi; serverga yuborilmoqda. Sahifani yopmang.'
      );
      schedulePush(1200);
    },
    retry() {
      schedulePush(0);
    },
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
