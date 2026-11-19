// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { STEPS } from './shared.js';
export function view0(scope) {
  return el(
    'ol',
    { className: 'mt-6 grid grid-cols-4 gap-2', 'aria-label': 'Kirish bosqichlari' },
    STEPS.map((item) => {
      const Icon = item.icon;
      const active = scope.step === item.num;
      const done = scope.step > item.num;
      return el(
        'li',
        {
          key: item.num,
          className: `flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
            active
              ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-300'
              : done
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
          }`,
        },
        el(Icon, { className: 'h-3.5 w-3.5 shrink-0' }),
        el('span', { className: 'truncate' }, item.num, '. ', item.title)
      );
    })
  );
}
