// Savollar xaritasi va bir savolning javob variantlarini chizadi.
import { $ } from '../core/dom.js';
import { renderContent } from '../core/content-renderer.js';
import { renderMath } from '../core/math-renderer.js';
import { renderQuestionMap } from './section-map.js';

export function renderQuestion(state, focus = false) {
  const current = state.current,
    question = state.questions[current];
  const answered = state.answers.filter((a) => a !== null).length;
  $('question-number').textContent = `${current + 1}-savol / ${state.questions.length}`;
  $('test-nav-question-number').textContent = $('question-number').textContent;
  $('question-title').innerHTML = renderContent(question.q, question.contentFormat);
  $('prog').textContent = `${answered} / ${state.questions.length} ta savolga javob berildi`;
  $('progress').value = (answered / state.questions.length) * 100;
  $('options').innerHTML = question.options
    .map(
      (option, index) => `<label class="option">
    <input type="radio" name="answer" value="${index}" ${state.answers[current] === index ? 'checked' : ''}>
    <span class="option-letter" aria-hidden="true">${'ABCDEF'[index]}</span>
<span>${renderContent(option, question.contentFormat)}</span>
</label>`
    )
    .join('');
  renderMath(document.querySelector('#question-title').parentElement);
  renderMath($('options'));
  renderQuestionMap(state);
  $('flag').textContent = state.flags.includes(current) ? '★ Belgilangan' : '☆ Keyinroq qaytaman';
  $('flag').setAttribute('aria-pressed', String(state.flags.includes(current)));
  $('prev').disabled = current === 0;
  const lastQuestion = current === state.questions.length - 1;
  $('next').hidden = lastQuestion;
  $('next-slot').hidden = lastQuestion;
  $('next').textContent = current === state.questions.length - 1 ? 'Testni yakunlash' : 'Keyingi →';
  $('next').disabled = false;
  if (focus) $('question-title').focus();
}
