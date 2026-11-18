// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { BookOpen } from '../../components/icons.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view1 } from './view1.js';
export function view2(scope) {
  return el(
    'div',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-800' },
      el(BookOpen, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el(
        'div',
        null,
        el(
          'h1',
          { className: 'font-display text-xl font-bold text-slate-900 dark:text-white' },
          'Ochiq testlar'
        ),
        el(
          'p',
          { className: 'text-xs text-slate-500 dark:text-slate-400' },
          'Sinf va faol testni tanlab ishlash'
        )
      )
    ),
    scope.loading
      ? el('p', { className: 'py-8 text-center text-sm text-slate-500' }, 'Yuklanmoqda...')
      : scope.classes.length === 0
        ? el(
            'div',
            { className: 'pt-6' },
            el(EmptyState, {
              title: 'Ochiq sinf topilmadi',
              description:
                'Maktab kodi bilan kirish uchun \u00ABKod bilan kirish\u00BB tugmasidan foydalaning.',
            })
          )
        : view1(scope)
  );
}
