// Mavzu yaratish, tanlab DOCX import qilish, qidirish va mavjud savol muharririni ulaydi.
import { modal } from '../components/modal.js';
import { esc } from '../core/dom.js';
import { call, post } from './teacher-api.js';
import { renderContent } from '../core/content-renderer.js';
import { renderQuestions, bindQuestionEditor } from './question-editor.js';
import { renderMath } from '../core/math-renderer.js';
export async function newTopic() {
  return modal(
    'Yangi mavzu',
    `<form class="stack">
    <label>Sinf<input id="topic-grade" required maxlength="60" placeholder="7"></label>
    <label>Fan<input id="topic-subject" required maxlength="100"></label>
    <label>Chorak<select id="topic-quarter">${[1, 2, 3, 4].map((v) => `<option>${v}</option>`).join('')}</select></label>
    <label>Mavzu<input id="topic-name" required maxlength="160"></label></form>`,
    {
      onConfirm: (d) =>
        post('topics', {
          grade: d.querySelector('#topic-grade').value,
          subject: d.querySelector('#topic-subject').value,
          quarter: +d.querySelector('#topic-quarter').value,
          name: d.querySelector('#topic-name').value,
        }),
    }
  );
}
export async function importTopic(id, file) {
  const topic = await call('topics/' + id),
    body = new FormData();
  body.append('file', file);
  const preview = await call('tests/preview', { method: 'POST', body });
  const html = preview.questions
    .map(
      (q, i) => `<article class="question-editor"><label>
    <input type="checkbox" data-import-index="${i}" checked> ${i + 1}-savolni olish</label>
    ${renderContent(q.q, q.contentFormat)}${q.options.map((o, j) => `<div>${j === q.answer ? "To'g'ri: " : ''}${'ABCDEF'[j]}. ${renderContent(o, q.contentFormat)}</div>`).join('')}</article>`
    )
    .join('');
  const pending = modal('Importni tekshiring va savollarni tanlang', html, {
    confirm: "Tanlanganlarni bazaga qo'shish",
    onConfirm: (d) =>
      post(`topics/${id}/import`, {
        version: topic.version,
        questions: [...d.querySelectorAll('[data-import-index]:checked')].map(
          (n) => preview.questions[+n.dataset.importIndex]
        ),
      }),
  });
  renderMath(document.querySelector('dialog'));
  return pending;
}
export async function inspectTopic(id) {
  const topic = await call('topics/' + id);
  const pending = modal(
    topic.name,
    `<label>Savol qidirish<input id="topic-search" type="search"></label>
    <div id="topic-questions"></div>`,
    { confirm: '', cancel: 'Yopish' }
  );
  const d = document.querySelector('dialog'),
    host = d.querySelector('#topic-questions');
  const draw = () => {
    const query = d.querySelector('#topic-search').value.toLowerCase();
    host.innerHTML = topic.questions
      .filter((q) => q.q.toLowerCase().includes(query))
      .map(
        (q) =>
          `<article class="question-editor">${renderContent(q.q, q.contentFormat)}<p>${q.archived ? 'Arxivlangan' : 'Faol'}</p>
      <button class="btn secondary" data-edit="${esc(q.id)}">Tahrirlash</button>
      <button class="btn secondary" data-archive="${esc(q.id)}">${q.archived ? 'Tiklash' : 'Arxivlash'}</button></article>`
      )
      .join('');
    renderMath(host);
  };
  d.querySelector('#topic-search').addEventListener('input', draw);
  host.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    button.disabled = true;
    try {
      const q = topic.questions.find((q) => q.id === (button.dataset.edit || button.dataset.archive));
      if (button.dataset.edit) {
        const updated = await editQuestion(q);
        if (!updated) return;
        Object.assign(
          topic,
          await post(
            `topics/${id}/question`,
            { questionId: q.id, version: topic.version, question: updated, archived: q.archived },
            'PUT'
          )
        );
      } else
        Object.assign(
          topic,
          await post(
            `topics/${id}/question`,
            { questionId: q.id, version: topic.version, archived: !q.archived },
            'PUT'
          )
        );
      draw();
    } catch (error) {
      d.querySelector('.error').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
  draw();
  return pending;
}
async function editQuestion(question) {
  const questions = [structuredClone(question)];
  const pending = modal(
    'Savolni tahrirlash',
    '<button id="add-question" hidden></button><div id="editor-questions"></div>',
    {
      onConfirm: () => {
        if (questions.length !== 1) throw new Error('Bitta savol saqlang.');
      },
    }
  );
  const d = [...document.querySelectorAll('dialog')].at(-1);
  const draw = () => {
    d.querySelector('#editor-questions').innerHTML = renderQuestions(questions);
  };
  bindQuestionEditor(d, () => questions, draw);
  draw();
  return (await pending) ? questions[0] : null;
}
