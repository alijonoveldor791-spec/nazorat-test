// Fanlar xaritasini bitta ochiq paneli bor akkordeon sifatida chizadi.
import { $, esc } from '../core/dom.js';
const views = new WeakMap();
export function renderQuestionMap(state) {
  const map = $('question-map');
  const sectioned = state.questions.some((q) => q.section);
  map.classList.toggle('sectioned-map', sectioned);
  if (!sectioned) {
    map.innerHTML = state.questions.map((_, i) => questionButton(state, i)).join('');
    return;
  }
  const groups = new Map();
  state.questions.forEach((q, index) => {
    const section = q.section || { id: 'unsectioned', type: 'Test', subject: 'Umumiy savollar' };
    if (!groups.has(section.id)) groups.set(section.id, { ...section, indexes: [] });
    groups.get(section.id).indexes.push(index);
  });
  const currentSection = state.questions[state.current].section?.id || 'unsectioned';
  let view = views.get(state);
  if (!view) {
    view = { current: state.current, open: currentSection };
    views.set(state, view);
  }
  if (view.current !== state.current) {
    view.current = state.current;
    view.open = currentSection;
  }
  map.innerHTML = [...groups.values()]
    .map((section, index) => {
      const answered = section.indexes.filter((i) => state.answers[i] !== null).length;
      const open = view.open === section.id;
      return `<section class="map-section">
    <h3><button type="button" class="map-section-toggle" data-map-section="${esc(section.id)}" id="map-heading-${index}" aria-expanded="${open}" aria-controls="map-section-${index}">
    <span class="map-section-label"><span class="map-section-type">${esc(section.type)}</span><strong>${esc(section.subject)}</strong><span class="map-section-count">${answered}/${section.indexes.length} ta javob</span></span></button></h3>
    <div id="map-section-${index}" class="map-section-grid" role="region" aria-labelledby="map-heading-${index}" ${open ? '' : 'hidden'}>${section.indexes.map((i) => questionButton(state, i)).join('')}</div></section>`;
    })
    .join('');
  map.querySelectorAll('[data-map-section]').forEach((button) =>
    button.addEventListener('click', () => {
      view.open = view.open === button.dataset.mapSection ? null : button.dataset.mapSection;
      map.querySelectorAll('[data-map-section]').forEach((header) => {
        const open = header.dataset.mapSection === view.open;
        header.setAttribute('aria-expanded', String(open));
        $(header.getAttribute('aria-controls')).hidden = !open;
      });
    })
  );
}
function questionButton(state, index) {
  return `<button type="button"
  aria-label="${index + 1}-savol${index === state.current ? ', hozirgi savol' : ''}${state.answers[index] !== null ? ', javob berilgan' : ', javobsiz'}${state.flags.includes(index) ? ', keyinroq qaytish uchun belgilangan' : ''}"
  ${index === state.current ? 'aria-current="step"' : ''}
  class="${state.answers[index] !== null ? 'answered ' : ''}${state.flags.includes(index) ? 'flagged ' : ''}${index === state.current ? 'current' : ''}"
  data-index="${index}">${index + 1}<span class="map-marks" aria-hidden="true">${state.answers[index] !== null ? '✓' : ''}${state.flags.includes(index) ? '!' : ''}</span></button>`;
}
