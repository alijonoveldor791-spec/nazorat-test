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
    `<div class="quarter-bulk"><label>Har bir mavzudan bir xil miqdor<input id="quarter-common-count" type="number" min="1" max="200" value="5"></label>
    <button type="button" class="btn secondary" data-apply-quarter>Barchasiga qo'llash</button></div>
    <p class="help">Umumiy miqdorni qo'llang yoki har bir mavzu uchun savollar sonini alohida kiriting.</p>
    <form class="stack">${topics
      .map(
        (t) =>
          `<label class="quarter-topic-amount"><span>${esc(t.name)}<small>Bazada ${t.count} ta savol</small></span><span>Testga olinadi<input aria-label="${esc(t.name)}: savollar soni" data-topic="${esc(t.id)}" type="number" min="1" max="${t.count}" value="1" required></span></label>`
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
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-apply-quarter]');
    if (!button) return;
    const dialog = button.closest('dialog');
    const common = dialog.querySelector('#quarter-common-count');
    if (!common.reportValidity() || !common.value) return;
    const fields = [...dialog.querySelectorAll('[data-topic]')];
    const shortages = fields.filter((field) => +field.max < +common.value);
    const error = dialog.querySelector('.error');
    if (shortages.length) {
      error.textContent = shortages
        .map(
          (field) =>
            `${field.getAttribute('aria-label').replace(': savollar soni', '')}: ${common.value} ta so'raldi, ${field.max} ta mavjud.`
        )
        .join(' ');
      return;
    }
    error.textContent = '';
    fields.forEach((field) => {
      field.value = common.value;
    });
    updateQuarterTotal(dialog);
  });
  document.addEventListener('input', (event) => {
    if (!event.target.matches('input[type="number"][data-topic]')) return;
    updateQuarterTotal(event.target.closest('dialog'));
  });
}
function updateQuarterTotal(dialog) {
  const total = [...dialog.querySelectorAll('[data-topic]')].reduce((sum, n) => sum + (+n.value || 0), 0);
  dialog.querySelector('#quarter-total').textContent =
    `Jami: ${total} ta savol${total > 200 ? ' (200 tadan oshmasin)' : ''}`;
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
