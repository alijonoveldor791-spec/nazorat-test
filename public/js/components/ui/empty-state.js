// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../../core/dom.js';
export function EmptyState({ title, description, action }) {
  return el(
    'div',
    {
      className:
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50',
    },
    el('h3', { className: 'text-base font-semibold text-slate-900 dark:text-slate-100' }, title),
    el('p', { className: 'mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400' }, description),
    action && el('div', { className: 'mt-5' }, action)
  );
}
