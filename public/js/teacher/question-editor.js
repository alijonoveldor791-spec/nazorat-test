// Qo\'lda savollarni tahrirlash va ularning variantlarini chizish.
import { esc } from '../core/dom.js';
import { empty } from '../components/empty-state.js';
import { toast } from '../components/toast.js';
import { renderContent } from '../core/content-renderer.js';
import { bindEditorImages } from './editor-images.js';
const removedOptions = new WeakMap();
const questionField = (q, i) =>
  q.contentFormat === 'rich-html-v1'
    ? `<div class="rich-editor" contenteditable="true" role="textbox" aria-label="${i + 1}-savol matni" aria-multiline="true" data-rich-q="${i}">${renderContent(q.q, q.contentFormat)}</div>`
    : `<textarea data-q="${i}" required maxlength="2000">${esc(q.q)}</textarea>`;
const optionField = (q, option, i, j) =>
  q.contentFormat === 'rich-html-v1'
    ? `<div class="rich-editor" contenteditable="true" role="textbox" aria-label="${i + 1}-savol ${'ABCDEF'[j]} varianti" aria-multiline="true" data-rich-option="${i}" data-index="${j}">${renderContent(option, q.contentFormat)}</div>`
    : `<input data-option="${i}" data-index="${j}" value="${esc(option)}" required maxlength="1000" aria-label="${i + 1}-savol ${'ABCDEF'[j]} varianti">`;
export function renderQuestions(questions) {
  const html = questions.length
    ? questions
        .map(
          (q, i) =>
            `<div class="question-editor stack" data-question="${i}">
<div class="row between">
<b>${i + 1}-savol${q.section ? ' / ' + esc(q.section.type + ' / ' + q.section.subject) : ''}</b>
<button type="button" class="btn danger small" data-remove="${i}">O\'chirish</button>
</div>
<div>Savol matni${questionField(q, i)}</div>
<p class="help">To\'g\'ri variant yonidagi doirani belgilang.${q.contentFormat === 'rich-html-v1' ? " Rasmni bosib o'lchamini o'zgartirish yoki o'chirish mumkin." : ''}</p>${q.options
              .map(
                (o, j) => `<div class="option-edit">
<input type="radio" name="correct-${i}" data-correct="${i}" value="${j}" ${q.answer === j ? 'checked' : ''} aria-label="${i + 1}-savol ${'ABCDEF'[j]} to\'g\'ri javob">
<span>${'ABCDEF'[j]}</span>
${optionField(q, o, i, j)}
</div>`
              )
              .join('')}<div class="row">
<button type="button" class="btn ghost small" data-add-option="${i}" ${q.options.length >= 6 ? 'disabled' : ''}>+ Variant</button>
<button type="button" class="btn ghost small" data-remove-option="${i}" ${q.options.length <= 2 ? 'disabled' : ''}>Oxirgi variantni olish</button>
<button type="button" class="btn secondary small" data-restore-option="${i}" ${!removedOptions.get(q)?.length || q.options.length >= 6 ? 'hidden' : ''}>Variantni qaytarish</button>
</div>
</div>`
        )
        .join('')
    : empty("Hali savol yo'q", "Fayl yuklang yoki qo'lda savol qo'shing.");
  return html;
}
export function bindQuestionEditor(dialog, getQuestions, drawQuestions) {
  const host = dialog.querySelector('#editor-questions');
  const syncField = (field) => {
    const d = field.dataset;
    const serialize = () => {
      const selected = field.querySelector('[data-editor-selected]');
      selected?.removeAttribute('data-editor-selected');
      const value = [...field.childNodes].map((node) => new XMLSerializer().serializeToString(node)).join('');
      selected?.setAttribute('data-editor-selected', '');
      return value;
    };
    if (d.q !== undefined) getQuestions()[d.q].q = field.value;
    if (d.option !== undefined) getQuestions()[d.option].options[d.index] = field.value;
    if (d.richQ !== undefined) getQuestions()[d.richQ].q = serialize();
    if (d.richOption !== undefined) getQuestions()[d.richOption].options[d.index] = serialize();
    if (d.correct !== undefined) getQuestions()[d.correct].answer = +field.value;
  };
  const clearImage = bindEditorImages(host, syncField);
  dialog.querySelector('#add-question').onclick = () => {
    if (getQuestions().length >= 200) return toast('200 savoldan oshmasin.', true);
    clearImage();
    getQuestions().push({ q: '', options: ['', ''], answer: 0 });
    drawQuestions();
  };
  host.oninput = (event) => {
    const field = event.target.closest('.rich-editor,input,textarea');
    if (field) syncField(field);
  };
  dialog.querySelector('#editor-questions').onclick = (event) => {
    const d = event.target.dataset;
    if (d.remove !== undefined) getQuestions().splice(+d.remove, 1);
    else if (d.addOption !== undefined) {
      const q = getQuestions()[d.addOption];
      if (q.options.length >= 6) return;
      q.options.push('');
    } else if (d.removeOption !== undefined) {
      const q = getQuestions()[d.removeOption];
      if (q.options.length <= 2) return;
      const history = removedOptions.get(q) || [];
      history.push({ value: q.options.pop(), answer: q.answer });
      if (history.length > 4) history.shift();
      removedOptions.set(q, history);
      if (q.answer >= q.options.length) q.answer = 0;
    } else if (d.restoreOption !== undefined) {
      const q = getQuestions()[d.restoreOption];
      if (q.options.length >= 6) return;
      const saved = removedOptions.get(q)?.pop();
      if (!saved) return;
      q.options.push(saved.value);
      if (saved.answer === q.options.length - 1) q.answer = saved.answer;
    } else return;
    clearImage();
    drawQuestions();
  };
  return clearImage;
}
