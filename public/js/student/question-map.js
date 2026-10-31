// Savollar xaritasi va bir savolning javob variantlarini chizadi.
import { $, esc } from '../core/dom.js';

export function renderQuestion(state, focus = false) {
  const current = state.current,
    question = state.questions[current];
  const answered = state.answers.filter((a) => a !== null).length;
  $('question-number').textContent = `${current + 1}-savol / ${state.questions.length}`;
  $('question-title').textContent = question.q;
  $('prog').textContent = `${answered} / ${state.questions.length} ta savolga javob berildi`;
  $('progress').value = (answered / state.questions.length) * 100;
  $('options').innerHTML = question.options
    .map(
      (option, index) => `<label class="option">
    <input type="radio" name="answer" value="${index}" ${state.answers[current] === index ? 'checked' : ''}>
    <span class="option-letter" aria-hidden="true">${'ABCDEF'[index]}</span>
<span>${esc(option)}</span>
</label>`
    )
    .join('');
  $('question-map').innerHTML = state.questions
    .map(
      (_, index) => `<button
    aria-label="${index + 1}-savol${state.answers[index] !== null ? ', javob berilgan' : ', javobsiz'}${state.flags.includes(index) ? ', belgilangan' : ''}"
    ${index === current ? 'aria-current="step"' : ''}
    class="${state.answers[index] !== null ? 'answered ' : ''}${state.flags.includes(index) ? 'flagged ' : ''}${index === current ? 'current' : ''}"
    data-index="${index}">${index + 1}</button>`
    )
    .join('');
  $('flag').textContent = state.flags.includes(current) ? '★ Belgilangan' : '☆ Keyinroq qaytaman';
  $('flag').setAttribute('aria-pressed', String(state.flags.includes(current)));
  $('prev').disabled = current === 0;
  $('next').disabled = current === state.questions.length - 1;
  if (focus) $('question-title').focus();
}
