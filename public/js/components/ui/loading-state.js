// Sahifa va urinish uchun yagona yengil skelet-yuklanish ko'rinishini yaratadi.
import { el } from '../../core/dom.js';
export function LoadingState({ label = 'Sahifa tayyorlanmoqda...' } = {}) {
  return el(
    'section',
    { className: 'page-skeleton', role: 'status', 'aria-busy': 'true' },
    el('span', { className: 'loading-brand', 'aria-hidden': 'true' }, 'N'),
    el('p', { className: 'loading-label' }, label),
    el('div', { className: 'skeleton-line skeleton-title', 'aria-hidden': 'true' }),
    el('div', { className: 'skeleton-line', 'aria-hidden': 'true' }),
    el(
      'div',
      { className: 'skeleton-cards', 'aria-hidden': 'true' },
      [0, 1, 2].map((key) => el('div', { key, className: 'skeleton-card' }))
    )
  );
}
