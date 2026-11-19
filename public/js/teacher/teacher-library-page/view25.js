// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view25(scope) {
  return el(
    'div',
    { className: 'grid gap-3 sm:grid-cols-2' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium' }, 'Vaqt (daqiqa)'),
      el('input', {
        type: 'number',
        min: 0,
        max: 240,
        value: scope.pubTime,
        onChange: (e) => scope.setPubTime(Number(e.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium' }, 'Urinishlar'),
      el('input', {
        type: 'number',
        min: 1,
        max: 100,
        value: scope.pubAttempts,
        onChange: (e) => scope.setPubAttempts(Number(e.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    )
  );
}
