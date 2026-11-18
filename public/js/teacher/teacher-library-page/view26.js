// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view25 } from './view25.js';
export function view26(scope) {
  return el(
    'form',
    { id: 'publish-online-form', onSubmit: scope.handlePublishOnline, className: 'space-y-4' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium' }, 'Sinf yoki guruh'),
      el(
        'select',
        {
          value: scope.pubClassId,
          onChange: (e) => scope.setPubClassId(e.target.value),
          required: true,
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        scope.classes.map((c) => el('option', { key: c.id, value: c.id }, c.name))
      )
    ),
    view25(scope),
    el(
      'label',
      { className: 'flex items-center gap-2 text-sm' },
      el('input', {
        type: 'checkbox',
        checked: scope.pubShuffleQ,
        onChange: (e) => scope.setPubShuffleQ(e.target.checked),
      }),
      el('span', null, 'Savollarni aralashtirish')
    ),
    el(
      'label',
      { className: 'flex items-center gap-2 text-sm' },
      el('input', {
        type: 'checkbox',
        checked: scope.pubShuffleO,
        onChange: (e) => scope.setPubShuffleO(e.target.checked),
      }),
      el('span', null, 'Variantlarni aralashtirish')
    )
  );
}
