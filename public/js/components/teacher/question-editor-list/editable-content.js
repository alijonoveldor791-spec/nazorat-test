// Muharrir DOM'idan tanlov belgilarisiz HTML va asl MathML formulalarini saqlaydi.
import { renderMathInElement } from '../../../core/content.js';

export function renderEditableMath(element) {
  for (const math of element.querySelectorAll('math')) {
    if (math.closest('[data-editor-math]')) continue;
    const wrapper = document.createElement('span');
    wrapper.dataset.editorMath = new XMLSerializer().serializeToString(math);
    wrapper.contentEditable = 'false';
    math.replaceWith(wrapper);
    wrapper.append(math);
  }
  return renderMathInElement(element);
}
export function serializeEditableContent(element) {
  const clone = element.cloneNode(true);
  for (const wrapper of clone.querySelectorAll('[data-editor-math]')) {
    const doc = new DOMParser().parseFromString(wrapper.dataset.editorMath, 'application/xml');
    wrapper.replaceWith(document.importNode(doc.documentElement, true));
  }
  for (const selected of clone.querySelectorAll('[data-editor-selected]'))
    selected.removeAttribute('data-editor-selected');
  return Array.from(clone.childNodes)
    .map((node) => new XMLSerializer().serializeToString(node))
    .join('');
}
