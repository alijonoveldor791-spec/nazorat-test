// Test sahifasi: egalik, serverdan tiklash va modullarni bog\'lash.
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { initTheme } from '../core/theme.js';
import { toast } from '../components/toast.js';
import { mountStudentHeader } from '../components/student-header.js';
import { loadAttempt, saveAttempt, browserKey } from './test-state.js';
import { renderQuestion } from './question-map.js';
import { startTimer } from './timer.js';
import { serverClock } from './server-clock.js';
import { ownAttempt } from './tab-guard.js';
import { draftSync } from './draft-sync.js';
import { submission } from './submission.js';
import { initImagePreview } from './image-preview.js';
initImagePreview();
mountStudentHeader();
initTheme();
const state = loadAttempt();
let locked = false,
  sync,
  stopTimer = () => {},
  sender;
function save() {
  if (!saveAttempt(state)) $('save-status').textContent = "Qurilmada saqlash imkoni yo'q. Sahifani yopmang.";
}
function draw(focus = false) {
  renderQuestion(state, focus);
  document.querySelectorAll('#options input').forEach((input) => (input.disabled = locked));
  $('flag').disabled = locked;
  $('finish-test').disabled = locked && !state.pendingSubmit;
  $('prev').disabled = locked || state.current === 0;
  $('next').disabled = locked;
}
function freeze() {
  locked = true;
  draw();
}
function clock(value) {
  state.serverNow = value;
  state.clockReceivedAt = Date.now();
  save();
  return serverClock(value);
}
async function init() {
  if (!state) {
    location.replace('/test-kirish.html');
    return;
  }
  document.querySelector('.site-header')?.classList.add('test-active');
  $('student-test-meta').hidden = false;
  $('ttl').textContent = state.title;
  if (!(await ownAttempt(state.attemptId || state.attemptToken))) {
    $('test').hidden = false;
    $('test').classList.remove('hidden');
    $('ttl').textContent = 'Test boshqa oynada ochiq';
    document.querySelector('.test-layout').hidden = true;
    $('prog').textContent =
      "Avval ochilgan oynada davom eting. O'sha oynani yoping va bu sahifani yangilang.";
    return;
  }
  let now = serverClock(
    new Date(
      Date.parse(state.serverNow || new Date()) +
        Math.max(0, Date.now() - (state.clockReceivedAt || Date.now()))
    ).toISOString()
  );
  sender = submission(
    state,
    freeze,
    () => {
      stopTimer();
      sync?.stop();
    },
    $('next')
  );
  sync = draftSync(
    state,
    (value) => {
      now = clock(value);
    },
    sender.receive
  );
  try {
    const remote = await api('attempts/resume', {
      method: 'POST',
      body: JSON.stringify({ attemptToken: state.attemptToken, browserKey: browserKey() }),
    });
    if (remote.result) {
      sender.receive(remote.result);
      return;
    }
    state.deadline = remote.deadline;
    now = clock(remote.serverNow);
    if (remote.draftVersion > state.draftVersion) {
      state.answers = remote.answers;
      state.draftVersion = remote.draftVersion;
      state.dirty = false;
    }
    if (!remote.draftVersion && !state.draftVersion && state.answers.some((answer) => answer !== null))
      sync.changed();
    save();
  } catch (error) {
    $('terr').textContent =
      error.message + ' Lokal javoblar ochildi. Server vaqti aloqa tiklangach tekshiriladi.';
  }
  $('ttl').textContent = state.title;
  $('map-panel').open = innerWidth > 1023;
  locked = !!state.pendingSubmit;
  draw();
  $('test').classList.remove('hidden');
  $('test').hidden = false;
  stopTimer = startTimer(
    state.deadline,
    () => {
      freeze();
      sync.stop();
      sender.expire();
    },
    () => now()
  );
  if (state.pendingSubmit) sender.send(true);
  else if (state.dirty) sync.retry();
}
function move(index) {
  if (!state || index < 0 || index >= state.questions.length) return;
  state.current = index;
  save();
  draw(true);
}
function answer(value) {
  if (locked) return;
  state.answers[state.current] = value;
  sync.changed();
  draw();
  document.querySelector(`#options input[value="${value}"]`)?.focus({ preventScroll: true });
}
$('options').onchange = (event) => answer(Number(event.target.value));
$('prev').onclick = () => move(state.current - 1);
$('next').onclick = () => {
  if (state.pendingSubmit) sender?.send(true);
  else if (state.current === state.questions.length - 1) sender?.send();
  else move(state.current + 1);
};
$('finish-test').onclick = () => sender?.send(!!state?.pendingSubmit);
$('question-map').onclick = (event) => {
  const button = event.target.closest('[data-index]');
  if (button) move(+button.dataset.index);
};
$('flag').onclick = () => {
  if (locked) return;
  state.flags = state.flags.includes(state.current)
    ? state.flags.filter((i) => i !== state.current)
    : [...state.flags, state.current];
  save();
  draw();
};
document.addEventListener('keydown', (event) => {
  if (
    !state ||
    document.querySelector('dialog[open]') ||
    (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && event.target.type !== 'radio') ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  )
    return;
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    move(state.current + 1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    move(state.current - 1);
  } else {
    const index = /^[1-6]$/.test(event.key)
      ? +event.key - 1
      : /^[a-f]$/i.test(event.key)
        ? event.key.toUpperCase().charCodeAt(0) - 65
        : -1;
    if (index >= 0 && index < state.questions[state.current].options.length) {
      event.preventDefault();
      answer(index);
    }
  }
});
window.addEventListener('offline', () =>
  toast('Aloqa uzildi. Yangi javoblar faqat shu qurilmada saqlanadi.', true)
);
window.addEventListener('online', () => {
  toast('Aloqa tiklandi. Serverdagi holat tekshirilmoqda.');
  if (!state?.pendingSubmit) sync?.retry();
});
init().catch((error) => {
  $('test').hidden = false;
  $('test').classList.remove('hidden');
  $('terr').textContent = error.message;
});
