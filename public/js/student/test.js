// Testni boshqaradi; chizish, taymer va saqlash alohida modullarda.
import {$} from '../core/dom.js';
import {api} from '../core/api-client.js';
import {initTheme} from '../core/theme.js';
import {toast} from '../components/toast.js';
import {confirmAction} from '../components/modal.js';
import {mountStudentHeader} from '../components/student-header.js';
import {loadAttempt, saveAttempt, finishAttempt} from './test-state.js';
import {renderQuestion} from './question-map.js';
import {startTimer} from './timer.js';

mountStudentHeader(); initTheme();
const state = loadAttempt();
let sending = false, stopTimer = () => {};
if (!state?.attemptToken || !state.questions?.length) location.replace('/');
else {
  state.current = Math.min(state.current || 0, state.questions.length - 1);
  $('ttl').textContent = state.title; $('map-panel').open = innerWidth > 760;
  renderQuestion(state);
  stopTimer = startTimer(state.deadline, () => submit(true));
}
function save() {
  $('save-status').textContent = saveAttempt(state) ? '✓ Javoblar saqlandi' : 'Qurilmada saqlash imkoni yo’q. Sahifani yopmang.';
}
function move(index) {
  if (!state || index < 0 || index >= state.questions.length) return;
  state.current = index; save(); renderQuestion(state, true);
}
$('options').onchange = event => { state.answers[state.current] = Number(event.target.value); save(); renderQuestion(state); };
$('prev').onclick = () => move(state.current - 1);
$('next').onclick = () => move(state.current + 1);
$('question-map').onclick = event => { const button = event.target.closest('[data-index]'); if (button) move(+button.dataset.index); };
$('flag').onclick = () => {
  state.flags = state.flags.includes(state.current) ? state.flags.filter(i => i !== state.current) : [...state.flags, state.current];
  save(); renderQuestion(state);
};
document.addEventListener('keydown', event => {
  if (!state || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && event.target.type !== 'radio' || event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); move(state.current + 1); }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); move(state.current - 1); }
  else {
    const index = /^[1-6]$/.test(event.key) ? Number(event.key) - 1 : /^[a-f]$/i.test(event.key) ? event.key.toUpperCase().charCodeAt(0) - 65 : -1;
    if (index >= 0 && index < state.questions[state.current].options.length) { event.preventDefault(); state.answers[state.current] = index; save(); renderQuestion(state); }
  }
});
async function submit(automatic = false) {
  if (sending) return;
  const left = state.answers.filter(a => a === null).length;
  if (!automatic && !(await confirmAction('Test yakunlansinmi?', left ? `${left} ta savol javobsiz. Baribir yuborilsinmi?` : 'Barcha javoblar tayyor. Natijani yuborasizmi?'))) return;
  sending = true; $('send').disabled = true; $('terr').textContent = '';
  try {
    const result = await api('submit', {method:'POST', body:JSON.stringify({attemptToken:state.attemptToken, answers:state.answers})});
    finishAttempt(result, state); stopTimer(); location.assign('/natija.html');
  } catch (error) { $('terr').textContent = error.message + ' Javoblaringiz saqlangan.'; $('send').textContent = 'Qayta urinish'; }
  finally { sending = false; $('send').disabled = false; }
}
$('send').onclick = () => submit();
window.addEventListener('offline', () => toast('Aloqa uzildi. Javoblar shu qurilmada saqlanadi.', true));
window.addEventListener('online', () => toast('Internet aloqasi tiklandi.'));

if (state?.attemptToken) $('test').classList.remove('hidden');
