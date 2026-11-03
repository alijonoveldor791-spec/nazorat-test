// Javoblarni tartib raqami bilan serverga yuboradi; lokal nusxa doim saqlanadi.
import { api } from '../core/api-client.js';
import { browserKey, saveAttempt } from './test-state.js';
export function draftSync(state, onClock, onResult, onDraft = () => {}) {
  let timer,
    running = false,
    stopped = false,
    localSaved = true;
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
      onClock(response.serverNow);
      if (response.draftVersion > state.draftVersion) {
        state.answers = response.answers;
        state.draftVersion = response.draftVersion;
        state.dirty = false;
        persist();
        onDraft();
        status('Serverdagi yangi javoblar olindi. Davom etish uchun sahifani yangilang.');
        return;
      }
      if (state.draftVersion === version) {
        state.dirty = false;
        persist();
        status(localSaved ? '✓ Qurilmada va serverda saqlandi' : 'Serverda saqlandi · qurilmaga joy yetmadi');
      }
    } catch (error) {
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
          else if (r.draftVersion >= state.draftVersion) {
            state.answers = r.answers;
            state.draftVersion = r.draftVersion;
            state.dirty = false;
            persist();
            onClock(r.serverNow);
            onDraft();
            status(
              localSaved
                ? 'Serverdagi javoblar qurilmaga olindi'
                : 'Serverda saqlandi · qurilmaga joy yetmadi'
            );
          }
        } catch {}
    } finally {
      running = false;
      if (!stopped && state.dirty) timer = setTimeout(push, 5000);
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
      clearTimeout(timer);
      timer = setTimeout(push, 1200);
    },
    retry() {
      clearTimeout(timer);
      timer = setTimeout(push, 0);
    },
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
