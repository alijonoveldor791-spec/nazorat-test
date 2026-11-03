// Word savolini asl contentni o'zgartirmasdan preview va javob tanlovi bilan ko'rsatadi.
import { promptHtml, optionHtml } from '../components/rich-content.js';
export function richQuestionEditor(q, i) {
  return `<div class="question-editor stack" data-question="${i}">
<div class="row between"><b>${i + 1}-savol · Word</b><button type="button" class="btn danger small" data-remove="${i}">O'chirish</button></div>
<div class="rich-preview">${promptHtml(q)}</div>
<p class="help">Formulalar, rasm va jadvalni o'zgartirish uchun Word faylni tahrirlab qayta yuklang. To'g'ri javobni belgilang.</p>
${q.answer === null ? '<p class="error">To‘g‘ri javob hali belgilanmagan.</p>' : ''}
${q.options.map((_, j) => `<label class="option-edit"><input type="radio" name="correct-${i}" data-correct="${i}" value="${j}" ${q.answer === j ? 'checked' : ''} aria-label="${i + 1}-savol ${'ABCDEF'[j]} to'g'ri javob"><span>${'ABCDEF'[j]}</span><div>${optionHtml(q, j)}</div></label>`).join('')}
</div>`;
}
