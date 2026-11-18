// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../../../core/dom.js';
import { effect as useEffect, reference as useRef } from '../../../core/state.js';
import { renderMathInElement, sanitizeRichHtml } from '../../../core/content.js';
const LETTERS = 'ABCDEF';
function RichEditableField({ html, label, onCommit, onSelectImage }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const clean = sanitizeRichHtml(html, 'rich-html-v1');
    if (el.innerHTML !== clean) {
      el.innerHTML = clean;
      renderMathInElement(el);
    }
  }, [html]);
  const serialize = () => {
    const el = ref.current;
    if (!el) return '';
    const selected = el.querySelector('[data-editor-selected]');
    selected?.removeAttribute('data-editor-selected');
    const serialized = Array.from(el.childNodes)
      .map((node) => new XMLSerializer().serializeToString(node))
      .join('');
    if (selected) selected.setAttribute('data-editor-selected', '');
    return serialized;
  };
  return el('div', {
    ref: ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    role: 'textbox',
    'aria-label': label,
    'aria-multiline': 'true',
    onInput: () => onCommit(serialize()),
    onClick: (e) => {
      const img = e.target.closest('img');
      if (img && ref.current?.contains(img)) {
        e.preventDefault();
        onSelectImage(img, () => onCommit(serialize()));
      }
    },
    className:
      'rich-content min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white [&_[data-editor-selected]]:ring-2 [&_[data-editor-selected]]:ring-blue-500',
  });
}
export { LETTERS, RichEditableField };
