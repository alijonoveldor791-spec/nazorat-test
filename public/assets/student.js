import {$, esc, api, storage, toast, confirmAction} from './common.js';

const DRAFT = 'nazorat-attempt-v2';
let classes = [], tests = [], state = null, current = 0, timer, sending = false, warned = false;
const saved = storage.get(DRAFT);
if (saved?.attemptToken && saved?.questions?.length) $('resume').classList.remove('hidden');
const show = id => ['start','test','done'].forEach(key => $(key).classList.toggle('hidden', key !== id));
function save() {
  if (!state) return;
  state.current = current;
  $('save-status').textContent = storage.set(DRAFT, state) ? '✓ Javoblar saqlandi' : 'Qurilmada saqlash imkoni yo’q. Sahifani yopmang.';
}
async function init() {
  try {
    classes = await api('classes');
    $('grade').innerHTML = '<option value="">Sinfingizni tanlang</option>' + classes.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    if (!classes.length) $('serr').textContent = 'Hozircha sinflar yo’q. O’qituvchingizga murojaat qiling.';
  } catch (error) { $('grade').innerHTML = '<option value="">Yuklab bo’lmadi</option>'; $('serr').textContent = error.message; }
}
$('grade').onchange = async () => {
  const id = $('grade').value;
  $('tsel').disabled = true; $('tsel').innerHTML = '<option value="">Yuklanmoqda…</option>'; $('serr').textContent = ''; $('test-info').textContent = '';
  const selected = classes.find(c => c.id === id), roster = !!selected?.hasRoster;
  $('identity').classList.toggle('hidden', roster); $('roster-label').classList.toggle('hidden', !roster);
  $('name').required = $('surname').required = !roster; $('student').required = roster;
  if (!id) { $('tsel').innerHTML = '<option value="">Avval sinfni tanlang</option>'; return; }
  try {
    const [list, students] = await Promise.all([api('tests?classId=' + encodeURIComponent(id)), roster ? api('classes/' + encodeURIComponent(id) + '/students') : []]);
    if ($('grade').value !== id) return;
    tests = list;
    $('student').innerHTML = '<option value="">Ro’yxatdan tanlang</option>' + students.map(s => `<option value="${esc(s.id)}">${esc(s.surname)} ${esc(s.name)}</option>`).join('');
    $('tsel').innerHTML = list.length ? list.map(t => `<option value="${esc(t.id)}">${esc(t.title)} · ${t.count} savol</option>`).join('') : '<option value="">Hozir faol test yo’q</option>';
    $('tsel').disabled = !list.length; testInfo();
  } catch (error) { if ($('grade').value === id) { $('tsel').innerHTML = '<option value="">Yuklab bo’lmadi</option>'; $('serr').textContent = error.message; } }
};
function testInfo() { const t = tests.find(t => t.id === $('tsel').value); $('test-info').textContent = t ? `${t.settings.timeLimitMin ? t.settings.timeLimitMin + ' daqiqa' : 'Vaqt cheklanmagan'} · ${t.settings.maxAttempts} marta topshirish mumkin` : ''; }
$('tsel').onchange = testInfo;
$('start-form').onsubmit = async event => {
  event.preventDefault(); $('serr').textContent = ''; $('go').disabled = true;
  try {
    const identity = {classId:$('grade').value, studentId:$('student').value, name:$('name').value.trim(), surname:$('surname').value.trim()};
    const attempt = await api('tests/' + encodeURIComponent($('tsel').value) + '/start', {method:'POST', body:JSON.stringify(identity)});
    state = {...attempt, answers:Array(attempt.questions.length).fill(null), flags:[], current:0}; current = 0; save(); start();
  } catch (error) { $('serr').textContent = error.message; }
  finally { $('go').disabled = false; }
};
$('continue').onclick = () => { state = saved; current = Math.min(saved.current || 0, saved.questions.length - 1); start(); };
$('discard').onclick = async () => { if (await confirmAction('Saqlangan javoblar bekor qilinsinmi?', 'Boshlangan urinish va uning vaqti serverda saqlanadi. Yangi urinish cheklangan bo’lishi mumkin.')) { storage.remove(DRAFT); $('resume').classList.add('hidden'); } };
function start() {
  show('test'); $('ttl').textContent = state.title; render(); clearInterval(timer); warned = false; tick(); timer = setInterval(tick, 1000);
}
function render(focus = false) {
  const q = state.questions[current], count = state.answers.filter(a => a !== null).length;
  $('question-number').textContent = `${current + 1}-savol / ${state.questions.length}`; $('question-title').textContent = q.q;
  $('prog').textContent = `${count} / ${state.questions.length} ta savolga javob berildi`; $('progress').value = count / state.questions.length * 100;
  $('options').innerHTML = q.options.map((o, i) => `<label class="option"><input type="radio" name="answer" value="${i}" ${state.answers[current] === i ? 'checked' : ''}><span class="option-letter" aria-hidden="true">${'ABCDEF'[i]}</span><span>${esc(o)}</span></label>`).join('');
  $('question-map').innerHTML = state.questions.map((_, i) => `<button aria-label="${i + 1}-savol${state.answers[i] !== null ? ', javob berilgan' : ', javobsiz'}${state.flags.includes(i) ? ', belgilangan' : ''}" ${i === current ? 'aria-current="step"' : ''} class="${state.answers[i] !== null ? 'answered ' : ''}${state.flags.includes(i) ? 'flagged ' : ''}${i === current ? 'current' : ''}" data-index="${i}">${i + 1}</button>`).join('');
  $('flag').textContent = state.flags.includes(current) ? '★ Belgilangan' : '☆ Keyinroq qaytaman'; $('flag').setAttribute('aria-pressed', String(state.flags.includes(current)));
  $('prev').disabled = current === 0; $('next').disabled = current === state.questions.length - 1;
  if (focus) $('question-title').focus();
}
$('options').onchange = event => { state.answers[current] = Number(event.target.value); save(); render(); };
function move(index) { if (!state || index < 0 || index >= state.questions.length) return; current = index; save(); render(true); }
$('prev').onclick = () => move(current - 1); $('next').onclick = () => move(current + 1);
$('question-map').onclick = event => { const button = event.target.closest('[data-index]'); if (button) move(+button.dataset.index); };
$('flag').onclick = () => { state.flags = state.flags.includes(current) ? state.flags.filter(i => i !== current) : [...state.flags, current]; save(); render(); };
document.addEventListener('keydown', event => {
  if (!state || $('test').classList.contains('hidden') || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && event.target.type !== 'radio' || event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); move(current + 1); }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); move(current - 1); }
  else {
    const index = /^[1-6]$/.test(event.key) ? Number(event.key) - 1 : /^[a-f]$/i.test(event.key) ? event.key.toUpperCase().charCodeAt(0) - 65 : -1;
    if (index >= 0 && index < state.questions[current].options.length) { event.preventDefault(); state.answers[current] = index; save(); render(); }
  }
});
function tick() {
  if (!state?.deadline) { $('timer').textContent = 'Vaqt cheklanmagan'; return; }
  const left = Math.max(0, Math.ceil((Date.parse(state.deadline) - Date.now()) / 1000));
  $('timer').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; $('timer').classList.toggle('urgent', left <= 60);
  if (left <= 60 && !warned) { warned = true; toast('Bir daqiqadan kam vaqt qoldi.', true); }
  if (!left) { clearInterval(timer); submit(true); }
}
async function submit(automatic = false) {
  if (sending) return;
  const left = state.answers.filter(a => a === null).length;
  if (!automatic && !(await confirmAction('Test yakunlansinmi?', left ? `${left} ta savol javobsiz. Baribir yuborilsinmi?` : 'Barcha javoblar tayyor. Natijani yuborasizmi?'))) return;
  sending = true; $('send').disabled = true; $('terr').textContent = '';
  try {
    const result = await api('submit', {method:'POST', body:JSON.stringify({attemptToken:state.attemptToken, answers:state.answers})});
    clearInterval(timer); storage.remove(DRAFT); show('done');
    const pct = Math.round(result.score / result.total * 100);
    $('dt').textContent = state.title; $('score').textContent = `${result.score} / ${result.total}`; $('result-percent').textContent = pct + '%';
    $('motivation').textContent = pct >= 86 ? 'Ajoyib natija! Shu sur’atda davom eting.' : pct >= 60 ? 'Yaxshi! Yana mashq qilsangiz, yanada yuqori natijaga erishasiz.' : 'Har bir urinish bilimni oshiradi. Mashq qilishda davom eting.';
    $('who').textContent = `${state.identity.surname} ${state.identity.name} · ${state.identity.grade}`;
    $('result-map').innerHTML = result.results.map((ok, i) => `<span class="${ok ? '' : 'wrong'}" aria-label="${i + 1}-savol ${ok ? 'to’g’ri' : 'noto’g’ri'}">${i + 1} ${ok ? '✓' : '×'}</span>`).join('');
    $('review').innerHTML = result.review ? `<div class="card"><h2>Javoblarni tahlil qiling</h2>${result.review.map((q, i) => `<div class="answer-detail"><h3>${i + 1}. ${esc(q.q)}</h3><p>Sizning javobingiz: ${esc(q.selected === null ? 'Javobsiz' : q.options[q.selected])}</p><p>To’g’ri javob: ${esc(q.options[q.answer])}</p></div>`).join('')}</div>` : '';
    state = null; scrollTo(0, 0);
  } catch (error) { $('terr').textContent = error.message + ' Javoblaringiz saqlangan.'; $('send').textContent = 'Qayta urinish'; }
  finally { sending = false; $('send').disabled = false; }
}
$('send').onclick = () => submit(false);
window.addEventListener('offline', () => toast('Aloqa uzildi. Javoblar shu qurilmada saqlanadi.', true));
window.addEventListener('online', () => toast('Internet aloqasi tiklandi.'));
init();
