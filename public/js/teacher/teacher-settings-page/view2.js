// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { formatDateTime } from '../../core/format.js';
export function view2(scope) {
  return el(
    'div',
    { className: 'space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800' },
    el(
      'h3',
      { className: 'text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400' },
      'Avtomatik va himoya nusxalari'
    ),
    el(
      'div',
      { className: 'space-y-2' },
      scope.archives.map((item) =>
        el(
          'div',
          {
            key: item.id,
            className:
              'flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs dark:border-slate-800',
          },
          el(
            'span',
            { className: 'text-slate-700 dark:text-slate-200' },
            formatDateTime(item.createdAt),
            ' \u00B7 ',
            item.source
          ),
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.handleDownloadArchive(item.id),
              className: 'font-medium text-blue-600 hover:underline dark:text-blue-400',
            },
            'Yuklab olish'
          )
        )
      )
    )
  );
}
