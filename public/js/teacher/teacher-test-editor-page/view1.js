// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view0 } from './view0.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2' },
    el(
      'label',
      { className: 'block space-y-1.5 sm:col-span-2' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Test nomi'),
      el('input', {
        type: 'text',
        required: true,
        maxLength: 120,
        value: scope.title,
        onChange: (e) => scope.setTitle(e.target.value),
        placeholder: 'Masalan: 7-sinf Algebra 1-chorak nazorat',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    view0(scope),
    scope.forClass &&
      el(
        'label',
        { className: 'block space-y-1.5' },
        el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Fan'),
        el('input', {
          type: 'text',
          maxLength: 100,
          value: scope.subject,
          onChange: (e) => scope.setSubject(e.target.value),
          placeholder: 'Masalan: Matematika',
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        })
      ),
    scope.forGroup &&
      el(
        'label',
        { className: 'block space-y-1.5' },
        el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, "Yo'nalish"),
        el('input', {
          type: 'text',
          list: 'editor-directions',
          required: true,
          maxLength: 100,
          value: scope.direction,
          onChange: (e) => scope.setDirection(e.target.value),
          placeholder: "Guruh yo'nalishini tanlang yoki yozing",
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        }),
        el(
          'datalist',
          { id: 'editor-directions' },
          scope.groupDirections.map((d) => el('option', { key: d, value: d }))
        )
      )
  );
}
