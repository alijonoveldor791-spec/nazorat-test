// Yangi urinishni saqlash va mavjud qurilma urinishini serverdan qayta tekshirish.
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { confirmAction } from '../components/modal.js';
import { loadAttempt, saveAttempt, discardAttempt, browserKey, finishAttempt } from './test-state.js';
import { hasOpenAttempt } from './tab-guard.js';
let navigating = false;
const checkRemote = (state) =>
  api('attempts/resume', {
    method: 'POST',
    body: JSON.stringify({ attemptToken: state.attemptToken, browserKey: browserKey() }),
  });
export async function beginEntry(start) {
  if (navigating) throw new Error('Oldingi amal tugashini kuting.');
  navigating = true;
  try {
    return await createEntry(start);
  } finally {
    navigating = false;
  }
}
async function createEntry(start) {
  const existing = loadAttempt();
  if (existing && (await hasOpenAttempt(existing.attemptId || existing.attemptToken)))
    throw new Error("Test boshqa oynada ochiq. O'sha oynada davom eting yoki uni yoping.");
  if (
    existing &&
    !(await confirmAction(
      'Yangi test boshlansinmi?',
      'Shu qurilmadagi oldingi test javoblari yangi urinish bilan almashtiriladi. Oldingi urinish muddati serverda davom etadi.'
    ))
  )
    return;
  const attempt = await start(browserKey());
  const same =
    existing && (existing.attemptId === attempt.attemptId || existing.attemptToken === attempt.attemptToken);
  const keepLocal = same && existing.draftVersion >= (attempt.draftVersion || 0);
  const state = {
    ...(same ? existing : {}),
    ...attempt,
    answers: keepLocal ? existing.answers : attempt.answers || Array(attempt.questions.length).fill(null),
    draftVersion: keepLocal ? existing.draftVersion : attempt.draftVersion || 0,
    dirty: !!(keepLocal && existing.dirty),
    flags: same ? existing.flags : [],
    current: same ? existing.current : 0,
    clockReceivedAt: Date.now(),
  };
  if (!saveAttempt(state))
    throw new Error("Qurilmada saqlash imkoni yo'q. Brauzer sozlamalarini tekshiring.");
  location.assign('/test.html');
}
export function initResume() {
  let checking = false;
  async function inspect() {
    if (checking) return;
    const state = loadAttempt();
    if (!state) {
      $('resume').hidden = true;
      return;
    }
    checking = true;
    $('continue').disabled = true;
    try {
      const remote = await checkRemote(state);
      if (loadAttempt()?.attemptToken !== state.attemptToken) return;
      $('resume').hidden = false;
      $('resume-title').textContent = remote.result ? 'Testingiz yakunlangan' : 'Yakunlanmagan testingiz bor';
      $('continue').textContent = remote.result ? "Natijani ko'rish" : 'Davom etish';
      $('resume-info').textContent = state.title + ' · Urinish va server muddati tekshirildi.';
      $('resume-error').textContent = '';
      $('continue').disabled = false;
    } catch (error) {
      $('resume').hidden = true;
      if (![401, 403, 404].includes(error.status)) {
        $('entry-error').textContent =
          "Saqlangan testni serverda tekshirib bo'lmadi. Aloqa tiklangach qayta tekshiriladi.";
      }
    } finally {
      checking = false;
    }
  }
  $('continue').addEventListener('click', async () => {
    if (navigating) return;
    const state = loadAttempt();
    if (!state) {
      $('resume').hidden = true;
      return;
    }
    $('continue').disabled = true;
    navigating = true;
    try {
      if (await hasOpenAttempt(state.attemptId || state.attemptToken))
        throw new Error("Bu test boshqa oynada ochiq. O'sha oynada davom eting.");
      const remote = await checkRemote(state);
      if (loadAttempt()?.attemptToken !== state.attemptToken)
        throw new Error("Saqlangan test o'zgardi. Sahifani yangilang.");
      if (remote.result) {
        finishAttempt(remote.result, state);
        location.assign('/natija.html');
        return;
      }
      if (remote.draftVersion > state.draftVersion) {
        state.answers = remote.answers;
        state.draftVersion = remote.draftVersion;
        state.dirty = false;
      }
      state.deadline = remote.deadline;
      state.serverNow = remote.serverNow;
      state.clockReceivedAt = Date.now();
      if (!saveAttempt(state)) throw new Error("Qurilmaga saqlab bo'lmadi. Joyni tekshiring.");
      location.assign('/test.html');
    } catch (error) {
      $('resume-error').textContent = error.message;
    } finally {
      navigating = false;
      $('continue').disabled = false;
    }
  });
  $('discard').addEventListener('click', async () => {
    if (navigating) return;
    if (
      await confirmAction(
        'Saqlangan test qurilmadan olib tashlansinmi?',
        "Mahalliy javoblar olib tashlanadi. Serverdagi urinish, natija va test muddati o'zgarmaydi."
      )
    ) {
      discardAttempt();
      $('resume').hidden = true;
    }
  });
  window.addEventListener('online', inspect);
  window.addEventListener('storage', (event) => {
    if (event.key === 'nazorat-attempt-v2') inspect();
  });
  inspect();
}
