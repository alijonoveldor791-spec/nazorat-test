// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { copyToClipboard } from '../../core/format.js';
export function view7(scope) {
  return el(
    'table',
    { className: 'w-full text-left text-sm' },
    el(
      'thead',
      { className: 'bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400' },
      el(
        'tr',
        null,
        el('th', { className: 'px-4 py-2.5' }, "O'quvchi"),
        el('th', { className: 'px-4 py-2.5' }, 'Shaxsiy kod'),
        el('th', { className: 'px-4 py-2.5 text-right' }, 'Nusxa')
      )
    ),
    el(
      'tbody',
      { className: 'divide-y divide-slate-100 dark:divide-slate-800' },
      (scope.codesModalClass.students || []).map((s) =>
        el(
          'tr',
          { key: s.id },
          el(
            'td',
            { className: 'px-4 py-2.5 font-medium text-slate-900 dark:text-white' },
            s.surname,
            ' ',
            s.name
          ),
          el(
            'td',
            { className: 'px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-200' },
            s.accessCode || '—'
          ),
          el(
            'td',
            { className: 'px-4 py-2.5 text-right' },
            s.accessCode &&
              el(
                'button',
                {
                  type: 'button',
                  onClick: async () => {
                    const ok = await copyToClipboard(s.accessCode);
                    scope.toast(ok ? 'Kod nusxalandi.' : 'Nusxalanmadi.', !ok);
                  },
                  className: 'text-xs font-medium text-blue-600 hover:underline dark:text-blue-400',
                },
                'Nusxalash'
              )
          )
        )
      )
    )
  );
}
