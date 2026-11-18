// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view2(scope) {
  return el(
    'div',
    { className: 'grid gap-2 sm:grid-cols-2 md:grid-cols-3' },
    scope.visibleClasses.map((cls) =>
      el(
        'label',
        {
          key: cls.id,
          className:
            'flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50',
        },
        el('input', {
          type: 'checkbox',
          checked: scope.selectedClassIds.has(cls.id),
          onChange: () =>
            scope.setSelectedClassIds((prev) => {
              const next = new Set(prev);
              if (next.has(cls.id)) next.delete(cls.id);
              else next.add(cls.id);
              return next;
            }),
          className: 'h-4 w-4 rounded border-slate-300 text-blue-600',
        }),
        el('span', { className: 'truncate font-medium text-slate-800 dark:text-slate-200' }, cls.name)
      )
    )
  );
}
