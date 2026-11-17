// Mavzuga savollarni umumiy Word preview va savol muharriri orqali qo'shadi.
import { modal } from '../components/modal.js';
import { esc } from '../core/dom.js';
import { call, post } from './teacher-api.js';
import { bindTestImport } from './test-import.js';
import { renderTestImport } from './test-import-view.js';
import { renderQuestions, bindQuestionEditor } from './question-editor.js';
export async function importTopic(id) {
  const topic = await call('topics/' + id);
  let questions = [];
  const excluded = new WeakSet();
  const pending = modal(
    "Mavzuga savollar qo'shish",
    `<p>${esc(topic.name)} / ${topic.quarter}-chorak</p>${renderTestImport()}
  <div class="row between"><h3>Savollarni tahrirlash</h3><button type="button" class="btn secondary" id="add-question">+ Savol</button></div>
  <p class="help">Savollar va variantlarni tahrirlang, to'g'ri javobni belgilang. Faqat belgilangan savollar qo'shiladi; avvalgi savollar saqlanadi.</p><div id="editor-questions" class="stack"></div>`,
    {
      confirm: "Tanlanganlarni bazaga qo'shish",
      onConfirm: async () => {
        const chosen = questions.filter((q) => !excluded.has(q));
        if (!chosen.length) throw new Error('Kamida bitta savol kiriting yoki tanlang.');
        await post(`topics/${id}/import`, { version: topic.version, questions: chosen });
      },
    }
  );
  const dialog = [...document.querySelectorAll('dialog')].at(-1);
  const host = dialog.querySelector('#editor-questions');
  const draw = () => {
    host.innerHTML = renderQuestions(questions);
    host
      .querySelectorAll('[data-question]')
      .forEach((node, i) =>
        node.insertAdjacentHTML(
          'afterbegin',
          `<label class="check"><input type="checkbox" data-import-index="${i}" ${excluded.has(questions[i]) ? '' : 'checked'}>${i + 1}-savolni olish</label>`
        )
      );
  };
  host.addEventListener('change', (event) => {
    const index = event.target.dataset.importIndex;
    if (index === undefined) return;
    if (event.target.checked) excluded.delete(questions[+index]);
    else excluded.add(questions[+index]);
  });
  bindTestImport(
    dialog,
    (value) => {
      questions = value;
      draw();
    },
    () => questions.length > 0
  );
  bindQuestionEditor(dialog, () => questions, draw);
  draw();
  return pending;
}
