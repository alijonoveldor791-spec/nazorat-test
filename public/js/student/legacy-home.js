// Sinf, o\'quvchi va test tanlash sahifasi.
import { $, esc } from '../core/dom.js';
import { api } from '../core/api-client.js';
import { initTheme } from '../core/theme.js';
import { confirmAction } from '../components/modal.js';
import { mountStudentHeader } from '../components/student-header.js';
import { loadAttempt, saveAttempt, discardAttempt, browserKey } from './test-state.js';
import { hasOpenAttempt } from './tab-guard.js';
import { startRequest, clearStartRequest } from './start-request.js';

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
    const existing = loadAttempt();
    if (existing && (await hasOpenAttempt(existing.attemptId || existing.attemptToken)))
      throw new Error("Test boshqa oynada ochiq. O'sha oynada davom eting yoki uni yoping.");
    if (
      existing &&
      !(await confirmAction(
        'Saqlangan test bilan nima qilinsin?',
        "Yangi test shu qurilmadagi oldingi draft o'rniga yoziladi. Oldingi testni davom ettirish uchun Bekor qilishni bosing."
      ))
    )
      return;
    const identity = {
      classId: $('grade').value,
      studentCode: $('student-code').value,
      browserKey: browserKey(),
      name: $('name').value.trim(),
      surname: $('surname').value.trim(),
    };
    const attempt = await api('tests/' + encodeURIComponent($('tsel').value) + '/start', {
      method: 'POST',
      body: JSON.stringify({ ...identity, requestId: await startRequest($('tsel').value, identity) }),
    });
    const same =
      existing &&
      (existing.attemptId === attempt.attemptId || existing.attemptToken === attempt.attemptToken);
    const state = {
      ...(same ? existing : {}),
      ...attempt,
      answers:
        same && existing.draftVersion >= (attempt.draftVersion || 0)
          ? existing.answers
          : attempt.answers || Array(attempt.questions.length).fill(null),
      draftVersion: same
        ? Math.max(existing.draftVersion || 0, attempt.draftVersion || 0)
        : attempt.draftVersion || 0,
      dirty: !!(same && existing.dirty && existing.draftVersion >= (attempt.draftVersion || 0)),
      flags: same ? existing.flags : [],
      current: same ? existing.current : 0,
      clockReceivedAt: Date.now(),
    };
    if (!saveAttempt(state))
      throw new Error("Qurilmada saqlash imkoni yo'q. Brauzer sozlamalarini tekshiring.");
    clearStartRequest();
    location.assign('/test.html');
  } catch (error) {
    $('serr').textContent = error.message;
  } finally {
    $('go').disabled = false;
  }
};
init();
