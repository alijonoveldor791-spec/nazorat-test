// teacher/test-form.js: sahifaning shu vazifasi uchun modul.

import { bindAudience, confirmTest } from './test-audience.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

import { data } from './data.js';
import { call, post } from './teacher-api.js';

import { editClass } from './class-editor.js';
import { renderTestForm } from './test-form-view.js';
import { renderQuestions, bindQuestionEditor } from './question-editor.js';
import { bindTestImport } from './test-import.js';
export async function editTest(id) {
  if (!data.classes.length) {
    toast('Avval sinf yarating.');
    await editClass();
    if (!data.classes.length) return;
  }
  const t = id
    ? await call('tests/' + id)
    : { title: '', classIds: [], questions: [], settings: { timeLimitMin: 0, maxAttempts: 1 }, schedule: {} };
  let questions = structuredClone(t.questions);

  const html = renderTestForm(t, data.classes);
  const requestId = crypto.randomUUID();
  const pending = modal(id ? 'Testni tahrirlash' : 'Yangi test', html, {
    confirm: 'Testni saqlash',
    onConfirm: async (accepted) => {
      const payload = testPayload(accepted, questions);
      if (!payload.classIds.length) throw new Error('Kamida bitta sinfni tanlang.');
      if (!payload.questions.length) throw new Error('Kamida bitta savol kiriting yoki preview qiling.');
      if (!(await confirmTest(payload, data.classes))) return false;
      await post(
        'tests' + (id ? '/' + id : ''),
        { ...payload, ...(!id ? { requestId } : {}) },
        id ? 'PUT' : 'POST'
      );
      toast('Test saqlandi.');
      location.assign('/oqituvchi/testlar.html');
    },
  });
  const dialog = document.querySelector('dialog:last-of-type');
  const testType = dialog.querySelector('#test-type');
  const scoringMode = dialog.querySelector('#scoring-mode');
  const updateScoring = () => {
    const block = testType.value === 'block';
    dialog.querySelector('#scoring-mode-label').hidden = !block;
    const hint = dialog.querySelector('#scoring-hint');
    hint.hidden = !block;
    hint.textContent =
      scoringMode.value === 'dtm'
        ? '1-mutaxassislik: 3,1; 2-mutaxassislik: 2,1; majburiy fanlar: 1,1 ball. Jami 189 ball.'
        : "Oddiy baholash: har bir to'g'ri javob 1 ball. 3,1 / 2,1 / 1,1 uchun DTM rejimini tanlang.";
  };
  testType.addEventListener('change', () => {
    if (testType.value === 'block') scoringMode.value = 'dtm';
    updateScoring();
  });
  scoringMode.addEventListener('change', updateScoring);
  updateScoring();
  const timeLimit = dialog.querySelector('#limit');
  timeLimit.addEventListener('focus', () => {
    if (timeLimit.value === '0') timeLimit.value = '';
  });
  timeLimit.addEventListener('blur', () => {
    if (timeLimit.value === '' && !timeLimit.validity.badInput) timeLimit.value = '0';
  });
  const drawQuestions = () => {
    dialog.querySelector('#editor-questions').innerHTML = renderQuestions(questions);
  };
  drawQuestions();
  bindAudience(dialog, t, data.classes);
  bindTestImport(
    dialog,
    (value) => {
      questions = value;
      if (questions.some((q) => q.section)) {
        dialog.querySelector('#test-type').value = 'block';
        dialog.querySelector('#test-type').dispatchEvent(new Event('change'));
      }
      drawQuestions();
    },
    () => questions.length > 0
  );
  bindQuestionEditor(dialog, () => questions, drawQuestions);
  await pending;
}
function testPayload(accepted, questions) {
  const value = (id) => accepted.querySelector('#' + id).value;
  const payload = {
    title: value('edit-title'),
    subject: value('edit-subject'),
    direction: value('edit-direction'),
    testType: value('test-type'),
    classIds: [...accepted.querySelectorAll('[name=classIds]:checked')].map((c) => c.value),
    questions,
    settings: {
      timeLimitMin: +value('limit'),
      maxAttempts: +value('attempts'),
      shuffleQuestions: accepted.querySelector('#shuffle-q').checked,
      shuffleOptions: accepted.querySelector('#shuffle-o').checked,
      showAnswers: accepted.querySelector('#show-answers').checked,
      hideResults: value('result-visibility') === 'hide',
      scoringMode: value('test-type') === 'block' ? value('scoring-mode') : 'normal',
    },
    schedule: {
      start: value('schedule-start') ? new Date(value('schedule-start') + '+05:00').toISOString() : null,
      end: value('schedule-end') ? new Date(value('schedule-end') + '+05:00').toISOString() : null,
    },
  };
  return payload;
}
