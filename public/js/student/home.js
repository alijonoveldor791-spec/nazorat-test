// Sinf, o’quvchi va test tanlash sahifasi.
import { $, esc } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { initTheme } from '../core/theme.js';
import { confirmAction } from '../components/modal.js';
import { mountStudentHeader } from '../components/student-header.js';
import { loadAttempt, saveAttempt, discardAttempt } from './test-state.js';

mountStudentHeader();
initTheme();
let classes = [],
  tests = [];
const saved = loadAttempt();
if (saved?.attemptToken && saved?.questions?.length) $('resume').classList.remove('hidden');
$('continue').onclick = () => location.assign('/test.html');
$('discard').onclick = async () => {
  if (
    await confirmAction(
      'Saqlangan javoblar bekor qilinsinmi?',
      'Boshlangan urinish va uning vaqti serverda saqlanadi. Yangi urinish cheklangan bo’lishi mumkin.'
    )
  ) {
    discardAttempt();
    $('resume').classList.add('hidden');
  }
};
async function init() {
  try {
    classes = await api('classes');
    $('grade').innerHTML =
      '<option value="">Sinfingizni tanlang</option>' +
      classes.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    if (!classes.length) $('serr').textContent = 'Hozircha sinflar yo’q. O’qituvchingizga murojaat qiling.';
  } catch (error) {
    $('grade').innerHTML = '<option value="">Yuklab bo’lmadi</option>';
    $('serr').textContent = error.message;
  }
}
function testInfo() {
  const test = tests.find((t) => t.id === $('tsel').value);
  $('test-info').textContent = test
    ? `${test.settings.timeLimitMin ? test.settings.timeLimitMin + ' daqiqa' : 'Vaqt cheklanmagan'} · ${test.settings.maxAttempts} marta topshirish mumkin`
    : '';
}
$('tsel').onchange = testInfo;
$('grade').onchange = async () => {
  const id = $('grade').value;
  $('tsel').disabled = true;
  $('tsel').innerHTML = '<option value="">Yuklanmoqda…</option>';
  $('serr').textContent = '';
  $('test-info').textContent = '';
  const roster = !!classes.find((c) => c.id === id)?.hasRoster;
  $('identity').classList.toggle('hidden', roster);
  $('roster-label').classList.toggle('hidden', !roster);
  $('name').required = $('surname').required = !roster;
  $('student').required = roster;
  if (!id) {
    $('tsel').innerHTML = '<option value="">Avval sinfni tanlang</option>';
    return;
  }
  try {
    const [list, students] = await Promise.all([
      api('tests?classId=' + encodeURIComponent(id)),
      roster ? api('classes/' + encodeURIComponent(id) + '/students') : [],
    ]);
    if ($('grade').value !== id) return;
    tests = list;
    $('student').innerHTML =
      '<option value="">Ro’yxatdan tanlang</option>' +
      students.map((s) => `<option value="${esc(s.id)}">${esc(s.surname)} ${esc(s.name)}</option>`).join('');
    $('tsel').innerHTML = list.length
      ? list.map((t) => `<option value="${esc(t.id)}">${esc(t.title)} · ${t.count} savol</option>`).join('')
      : '<option value="">Hozir faol test yo’q</option>';
    $('tsel').disabled = !list.length;
    testInfo();
  } catch (error) {
    if ($('grade').value === id) {
      $('tsel').innerHTML = '<option value="">Yuklab bo’lmadi</option>';
      $('serr').textContent = error.message;
    }
  }
};
$('start-form').onsubmit = async (event) => {
  event.preventDefault();
  $('serr').textContent = '';
  $('go').disabled = true;
  try {
    const identity = {
      classId: $('grade').value,
      studentId: $('student').value,
      name: $('name').value.trim(),
      surname: $('surname').value.trim(),
    };
    const attempt = await api('tests/' + encodeURIComponent($('tsel').value) + '/start', {
      method: 'POST',
      body: JSON.stringify(identity),
    });
    const state = { ...attempt, answers: Array(attempt.questions.length).fill(null), flags: [], current: 0 };
    if (!saveAttempt(state))
      throw new Error('Qurilmada saqlash imkoni yo’q. Brauzer sozlamalarini tekshiring.');
    location.assign('/test.html');
  } catch (error) {
    $('serr').textContent = error.message;
  } finally {
    $('go').disabled = false;
  }
};
init();
