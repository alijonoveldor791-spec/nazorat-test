// Sinf, o\'quvchi va test tanlash sahifasi.
import { $, esc } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { initTheme } from '../core/theme.js';
import { confirmAction } from '../components/modal.js';
import { mountStudentHeader } from '../components/student-header.js';
import { loadAttempt, discardAttempt } from './test-state.js';
import { beginEntry } from './entry-session.js';

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
      "Boshlangan urinish va uning vaqti serverda saqlanadi. Yangi urinish cheklangan bo'lishi mumkin."
    )
  ) {
    discardAttempt();
    $('resume').classList.add('hidden');
  }
};
async function init() {
  $('reload-classes').classList.add('hidden');
  try {
    classes = await api('classes');
    $('grade').innerHTML =
      '<option value="">Sinfingizni tanlang</option>' +
      classes.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    if (!classes.length) $('serr').textContent = "Hozircha sinflar yo'q. O'qituvchingizga murojaat qiling.";
  } catch (error) {
    $('grade').innerHTML = '<option value="">Yuklab bo\'lmadi</option>';
    $('serr').textContent = error.message;
    $('reload-classes').classList.remove('hidden');
  }
}
$('reload-classes').onclick = init;
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
  $('student-code').required = roster;
  $('open-mode').classList.toggle('hidden', roster);
  if (!id) {
    $('tsel').innerHTML = '<option value="">Avval sinfni tanlang</option>';
    return;
  }
  try {
    const list = await api('tests?classId=' + encodeURIComponent(id));
    if ($('grade').value !== id) return;
    tests = list;
    $('tsel').innerHTML = list.length
      ? list.map((t) => `<option value="${esc(t.id)}">${esc(t.title)} · ${t.count} savol</option>`).join('')
      : '<option value="">Hozir faol test yo\'q</option>';
    $('tsel').disabled = !list.length;
    testInfo();
  } catch (error) {
    if ($('grade').value === id) {
      $('tsel').innerHTML = '<option value="">Yuklab bo\'lmadi</option>';
      $('serr').textContent = error.message;
    }
  }
};
$('start-form').onsubmit = async (event) => {
  event.preventDefault();
  $('serr').textContent = '';
  $('go').disabled = true;
  try {
    const testId = $('tsel').value;
    const identity = {
      classId: $('grade').value,
      studentCode: $('student-code').value,
      name: $('name').value.trim(),
      surname: $('surname').value.trim(),
    };
    await beginEntry((browserKey) =>
      api('tests/' + encodeURIComponent(testId) + '/start', {
        method: 'POST',
        body: JSON.stringify({ ...identity, browserKey }),
      })
    );
  } catch (error) {
    if ($('serr')) $('serr').textContent = error.message;
  } finally {
    if ($('go')) $('go').disabled = false;
  }
};
init();
