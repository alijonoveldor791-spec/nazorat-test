// Yuborish tasdiqlanmaganda javoblarni saqlab, qayta tekshiradi.
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { confirmAction } from '../components/modal.js';
import { browserKey, saveAttempt, finishAttempt } from './test-state.js';
export function submission(state, freeze, stop, button = $('send')) {
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
    clearTimeout(retry);
    state.pendingSubmit = true;
    saveAttempt(state);
    freeze();
    sending = true;
    button.disabled = true;
    $('terr').textContent = 'Natija yuborilmoqda…';
    try {
      receive(
        await api('submit', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: state.attemptToken,
            browserKey: browserKey(),
            answers: state.answers,
          }),
        })
      );
    } catch (error) {
      $('terr').textContent = error.message + ' Javoblaringiz qurilmada saqlangan.';
      button.textContent = 'Qayta urinish';
      if (!error.status || error.status >= 500 || error.status === 429) {
        retry = setTimeout(
          () => send(true),
          Math.max(
            error.retryAfter ? error.retryAfter * 1000 : 0,
            Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5)) + Math.floor(Math.random() * 1001)
          )
        );
      }
    } finally {
      sending = false;
      button.disabled = finished;
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
