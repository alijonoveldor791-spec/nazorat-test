// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Minus, Plus } from '../../components/icons.js';
export function view5(scope, t, amt) {
  return el(
    'div',
    { className: 'inline-flex items-center gap-1' },
    el(
      'button',
      {
        type: 'button',
        onClick: () =>
          scope.setAmounts((prev) => ({
            ...prev,
            [t.id]: Math.max(1, (prev[t.id] ?? 1) - 1),
          })),
        className:
          'rounded-lg border border-slate-200 bg-white p-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900',
        'aria-label': 'Kamaytirish',
      },
      el(Minus, { className: 'h-3.5 w-3.5' })
    ),
    el('input', {
      type: 'number',
      min: 1,
      max: Math.min(200, t.count),
      value: amt,
      onChange: (e) => scope.setAmounts((prev) => ({ ...prev, [t.id]: Number(e.target.value) })),
      'aria-label': `${t.name}: savollar soni`,
      className:
        'w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-900',
    }),
    el(
      'button',
      {
        type: 'button',
        onClick: () =>
          scope.setAmounts((prev) => ({
            ...prev,
            [t.id]: Math.min(t.count, 200, (prev[t.id] ?? 1) + 1),
          })),
        className:
          'rounded-lg border border-slate-200 bg-white p-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900',
        'aria-label': 'Oshirish',
      },
      el(Plus, { className: 'h-3.5 w-3.5' })
    )
  );
}
