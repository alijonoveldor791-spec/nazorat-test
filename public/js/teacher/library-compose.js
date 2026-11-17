// Har mavzuga aniq miqdor, jami, savol almashtirish va tasdiqli qoralama saqlashni boshqaradi.
import { modal } from '../components/modal.js';
import { esc } from '../core/dom.js';
import { post } from './teacher-api.js';
import { renderContent } from '../core/content-renderer.js';
import { renderMath } from '../core/math-renderer.js';
export async function composeTopics(topics) {
  let draft;
  const chosen = await modal(
    'Tanlangan mavzulardan test tuzish',
    `<form class="stack">${topics
      .map(
        (t) =>
          `<label>${esc(t.name)} - mavjud: ${t.count}<input data-topic="${esc(t.id)}" type="number" min="1" max="${t.count}" value="1" required></label>`
      )
      .join('')}
    <output id="quarter-total" aria-live="polite">Jami: ${topics.length}</output></form>`,
    {
      confirm: 'Testni tuzish',
      onConfirm: async (d) => {
        draft = await post('quarter/compose', {
          topics: [...d.querySelectorAll('[data-topic]')].map((n) => ({
            id: n.dataset.topic,
            count: +n.value,
          })),
        });
      },
    }
  );
  if (!chosen) return null;
  return reviewDraft(draft);
}
export function bindQuarterTotal() {
  document.addEventListener('input', (event) => {
    if (!event.target.matches('input[type="number"][data-topic]')) return;
    const d = event.target.closest('dialog');
    d.querySelector('#quarter-total').textContent =
      'Jami: ' + [...d.querySelectorAll('[data-topic]')].reduce((sum, n) => sum + (+n.value || 0), 0);
  });
}
async function reviewDraft(draft) {
  let result;
  const pending = modal(
    'Test qoralamasi',
    `<label>Test nomi<input id="quarter-title" value="${esc(draft.title)}" maxlength="100" required></label>
    <button class="btn secondary" id="quarter-regenerate">Testni qayta tuzish</button><div id="quarter-preview"></div>`,
    {
      confirm: 'Qoralamani saqlash',
      onConfirm: async (d) => {
        result = await post('quarter/save', {
          title: d.querySelector('#quarter-title').value,
          subject: draft.subject,
          questions: draft.questions,
          topics: draft.topics,
          sources: draft.sources,
        });
      },
    }
  );
  const d = document.querySelector('dialog'),
    host = d.querySelector('#quarter-preview');
  const draw = () => {
    host.innerHTML = draft.questions
      .map(
        (q, i) => `<article class="question-editor"><b>${i + 1}.</b>
      ${renderContent(q.q, q.contentFormat)}${q.options.map((o, j) => `<div>${q.answer === j ? "To'g'ri: " : ''}${'ABCDEF'[j]}. ${renderContent(o, q.contentFormat)}</div>`).join('')}
      <button class="btn secondary" data-replace="${i}">Shu mavzudan almashtirish</button></article>`
      )
      .join('');
    renderMath(host);
  };
  const run = async (button, action) => {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try {
      await action();
      draw();
    } catch (error) {
      d.querySelector('.error').textContent = error.message;
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  };
  host.addEventListener('click', (event) => {
    const button = event.target.closest('[data-replace]');
    if (!button) return;
    run(button, async () => {
      const i = +button.dataset.replace;
      const replacement = await post('quarter/replace', {
        topicId: draft.sources[i].topicId,
        excluded: draft.sources.map((s) => s.questionId),
      });
      if (
        draft.questions.some(
          (q) =>
            q.q === replacement.question.q &&
            JSON.stringify(q.options) === JSON.stringify(replacement.question.options)
        )
      )
        throw new Error('Bu savol testda bor. Boshqa savol tanlash uchun qayta urining.');
      draft.questions[i] = replacement.question;
      draft.sources[i] = replacement.source;
    });
  });
  d.querySelector('#quarter-regenerate').addEventListener('click', (event) =>
    run(event.target, async () => {
      draft = await post('quarter/compose', { topics: draft.topics });
    })
  );
  draw();
  return (await pending) ? result : null;
}
