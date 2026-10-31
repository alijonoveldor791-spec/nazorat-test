// teacher/test-form.js: sahifaning shu vazifasi uchun modul.

import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

import { data, refresh } from './data.js';
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
  const pending = modal(id ? 'Testni tahrirlash' : 'Yangi test', html, { confirm: 'Testni saqlash' });
  const dialog = document.querySelector('dialog:last-of-type');
  const drawQuestions = () => {
    dialog.querySelector('#editor-questions').innerHTML = renderQuestions(questions);
  };
  drawQuestions();
  bindTestImport(dialog, (value) => {
    questions = value;
    drawQuestions();
  });
  bindQuestionEditor(dialog, () => questions, drawQuestions);
  const accepted = await pending;
  if (!accepted) return;
  const value = (id) => accepted.querySelector('#' + id).value;
  const payload = {
    title: value('edit-title'),
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
  try {
    await post('tests' + (id ? '/' + id : ''), payload, id ? 'PUT' : 'POST');
    toast('Test saqlandi.');
    await refresh();
    location.assign('/oqituvchi/testlar.html');
  } catch (error) {
    toast(error.message + ' Tahrir saqlanmadi.', true);
    sessionStorage.setItem('nazorat-editor-recovery', JSON.stringify(payload));
  }
}
