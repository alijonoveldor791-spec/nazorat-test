// teacher/test-form.js: sahifaning shu vazifasi uchun modul.

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
  const drawQuestions = () => {
    dialog.querySelector('#editor-questions').innerHTML = renderQuestions(questions);
  };
  drawQuestions();
  bindTestImport(
    dialog,
    (value) => {
      questions = value;
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
    classIds: [...accepted.querySelectorAll('[name=classIds]:checked')].map((c) => c.value),
    questions,
    settings: {
      timeLimitMin: +value('limit'),
      maxAttempts: +value('attempts'),
      shuffleQuestions: accepted.querySelector('#shuffle-q').checked,
      shuffleOptions: accepted.querySelector('#shuffle-o').checked,
      showAnswers: accepted.querySelector('#show-answers').checked,
    },
    schedule: {
      start: value('schedule-start') ? new Date(value('schedule-start') + '+05:00').toISOString() : null,
      end: value('schedule-end') ? new Date(value('schedule-end') + '+05:00').toISOString() : null,
    },
  };
  return payload;
}
