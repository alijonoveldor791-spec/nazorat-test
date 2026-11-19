// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view3(scope) {
  return el(
    'div',
    { className: 'grid gap-3 sm:grid-cols-2' },
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium' }, 'Holat'),
      el(
        'select',
        {
          value: scope.reviewStatus,
          onChange: (e) => scope.setReviewStatus(e.target.value),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        el('option', { value: 'approved' }, 'Tasdiqlash'),
        el('option', { value: 'rejected' }, 'Rad etish')
      )
    ),
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium' }, 'Tarif IDlari (vergul bilan)'),
      el('input', {
        type: 'text',
        value: scope.reviewTariffs,
        onChange: (e) => scope.setReviewTariffs(e.target.value),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1 sm:col-span-2' },
      el('span', { className: 'text-xs font-medium' }, 'Maktab ichki IDlari (vergul bilan)'),
      el('textarea', {
        rows: 2,
        value: scope.reviewSchools,
        onChange: (e) => scope.setReviewSchools(e.target.value),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    )
  );
}
