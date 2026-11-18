// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../../core/dom.js';
import { effect as useEffect, memo as useMemo, reference as useRef } from '../../core/state.js';
import { renderMathInElement, sanitizeRichHtml } from '../../core/content.js';
export function SafeContent({ value, content, format, inline = false, className = '' }) {
  const text = value ?? content ?? '';
  const hostRef = useRef(null);
  const richHtml = useMemo(
    () => (format === 'rich-html-v1' ? sanitizeRichHtml(text, format) : null),
    [text, format]
  );
  useEffect(() => {
    if (richHtml && hostRef.current) {
      renderMathInElement(hostRef.current);
    }
  }, [richHtml]);
  if (richHtml !== null) {
    return el('div', {
      ref: hostRef,
      className: `rich-content break-words ${inline ? 'inline-block align-top' : ''} ${className}`,
      dangerouslySetInnerHTML: { __html: richHtml },
    });
  }
  return el('span', { className: `whitespace-pre-wrap break-words ${className}` }, text);
}
