// Yuborish tasdiqlanmaganda javoblarni saqlab, qayta tekshiradi.
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { confirmAction } from '../components/modal.js';
import { browserKey, saveAttempt, finishAttempt } from './test-state.js';
export function submission(state, freeze, stop) {
  let sending = false,
    confirming = false,
    retry,
    attempts = 0,
    finished = false;
  function receive(result) {
    if (finished) return;
    finishAttempt(result, state);
    finished = true;
    clearTimeout(retry);
    stop();
    location.assign('/natija.html');
  }
  async function send(automatic = false) {
    if (sending || finished || (confirming && !automatic)) return;
    if (!automatic && !state.pendingSubmit) {
      confirming = true;
      const left = state.answers.filter((a) => a === null).length;
      let accepted;
      try {
        accepted = await confirmAction(
          'Test yakunlansinmi?',
          left
            ? `${left} ta savol javobsiz. Baribir yuborilsinmi?`
            : 'Barcha javoblar tayyor. Natijani yuborasizmi?'
        );
      } finally {
        confirming = false;
      }
      if (!accepted || sending || finished) return;
    }
    state.pendingSubmit = true;
    const localSaved = saveAttempt(state);
    freeze();
    sending = true;
    $('send').disabled = true;
    $('terr').textContent = 'Natija yuborilmoqda…';
    try {
      receive(
        await api('submit', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: state.attemptToken,
            browserKey: browserKey(),
            answers: state.answers,
            version: state.draftVersion,
          }),
        })
      );
    } catch (error) {
      $('terr').textContent =
        error.message +
        (localSaved
          ? ' Javoblaringiz qurilmada saqlangan.'
          : ' Qurilmada saqlash tasdiqlanmadi. Sahifani yopmang.');
      $('send').textContent = 'Qayta urinish';
      if (!error.status || error.status >= 500 || error.status === 429) {
        retry = setTimeout(
          () => send(true),
          Math.max(
            error.retryAfter ? error.retryAfter * 1000 : 0,
            Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5))
          )
        );
      }
    } finally {
      sending = false;
      $('send').disabled = false;
    }
  }
  window.addEventListener('online', () => {
    if (state.pendingSubmit) send(true);
  });
  return {
    send,
    receive,
    expire() {
      document.querySelector('dialog[open]')?.close('expired');
      send(true);
    },
  };
}
