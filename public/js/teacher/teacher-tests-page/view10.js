// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view10(scope) {
  return el(
    'div',
    { className: 'space-y-2 max-h-60 overflow-y-auto' },
    scope.assignableClasses
      .filter((c) =>
        !scope.assignDirection
          ? c.kind !== 'group'
          : c.kind === 'group' && c.direction === scope.assignDirection
      )
      .map((c) =>
        el(
          'label',
          {
            key: c.id,
            className:
              'flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-800',
          },
          el('input', {
            type: 'checkbox',
            checked: scope.assignClassIds.has(c.id),
            onChange: () =>
              scope.setAssignClassIds((prev) => {
                const next = new Set(prev);
                if (next.has(c.id)) next.delete(c.id);
                else next.add(c.id);
                return next;
              }),
            className: 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
          }),
          el('span', null, c.kind === 'group' ? 'Guruh' : 'Sinf', ': ', c.name)
        )
      )
  );
}
