// Qo\'lda savollarni tahrirlash va ularning variantlarini chizish.
import { esc } from '../core/dom.js';
import { empty } from '../components/empty-state.js';
import { toast } from '../components/toast.js';
export function renderQuestions(questions) {
  return questions.length
    ? questions
        .map(
          (q, i) =>
            `<div class="question-editor stack" data-question="${i}">
<div class="row between">
<b>${i + 1}-savol</b>
<button type="button" class="btn danger small" data-remove="${i}">O\'chirish</button>
</div>
<label>Savol matni<textarea data-q="${i}" required maxlength="2000">${esc(q.q)}</textarea>
</label>
<p class="help">To\'g\'ri variant yonidagi doirani belgilang.</p>${q.options
              .map(
                (o, j) => `<label class="option-edit">
<input type="radio" name="correct-${i}" data-correct="${i}" value="${j}" ${q.answer === j ? 'checked' : ''} aria-label="${i + 1}-savol ${'ABCDEF'[j]} to\'g\'ri javob">
<span>${'ABCDEF'[j]}</span>
<input data-option="${i}" data-index="${j}" value="${esc(o)}" required maxlength="1000" aria-label="${i + 1}-savol ${'ABCDEF'[j]} varianti">
</label>`
              )
              .join('')}<div class="row">
<button type="button" class="btn ghost small" data-add-option="${i}" ${q.options.length >= 6 ? 'disabled' : ''}>+ Variant</button>
<button type="button" class="btn ghost small" data-remove-option="${i}" ${q.options.length <= 2 ? 'disabled' : ''}>Oxirgi variantni olish</button>
</div>
</div>`
        )
        .join('')
    : empty("Hali savol yo'q", "Fayl yuklang yoki qo'lda savol qo'shing.");
}
export function bindQuestionEditor(dialog, getQuestions, drawQuestions) {
  dialog.querySelector('#add-question').onclick = () => {
    if (getQuestions().length >= 200) return toast('200 savoldan oshmasin.', true);
    getQuestions().push({ q: '', options: ['', ''], answer: 0 });
    drawQuestions();
  };
  dialog.querySelector('#editor-questions').oninput = (event) => {
    const d = event.target.dataset;
    if (d.q !== undefined) getQuestions()[d.q].q = event.target.value;
    if (d.option !== undefined) getQuestions()[d.option].options[d.index] = event.target.value;
    if (d.correct !== undefined) getQuestions()[d.correct].answer = +event.target.value;
  };
  dialog.querySelector('#editor-questions').onclick = (event) => {
    const d = event.target.dataset;
    if (d.remove !== undefined) getQuestions().splice(+d.remove, 1);
    else if (d.addOption !== undefined) getQuestions()[d.addOption].options.push('');
    else if (d.removeOption !== undefined) {
      const q = getQuestions()[d.removeOption];
      q.options.pop();
      if (q.answer >= q.options.length) q.answer = 0;
    } else return;
    drawQuestions();
  };
}
