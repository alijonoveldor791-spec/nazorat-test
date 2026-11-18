// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Modal } from '../../components/ui/modal.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { LETTERS } from './shared.js';
import { view3 } from './view3.js';
export function view4(scope) {
  return el(
    Modal,
    {
      open: Boolean(scope.reviewItem),
      onClose: () => scope.setReviewItem(null),
      title: "Tayyor testni ko'rib chiqish",
      size: 'lg',
      footer: el(
        fragment,
        null,
        el(
          'button',
          {
            type: 'button',
            onClick: () => scope.setReviewItem(null),
            className:
              'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700',
          },
          'Bekor qilish'
        ),
        el(
          'button',
          {
            type: 'button',
            disabled: scope.reviewBusy,
            onClick: scope.handleSaveReview,
            className:
              'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
          },
          scope.reviewBusy ? 'Saqlanmoqda...' : 'Saqlash'
        )
      ),
    },
    scope.reviewItem &&
      el(
        'div',
        { className: 'space-y-5' },
        view3(scope),
        el(
          'div',
          { className: 'space-y-3' },
          scope.reviewItem.questions.map((q, i) =>
            el(
              'div',
              {
                key: i,
                className: 'rounded-xl border border-slate-200 p-4 text-sm space-y-1.5 dark:border-slate-800',
              },
              el(
                'div',
                { className: 'font-semibold text-slate-900 dark:text-white' },
                i + 1,
                '. ',
                el(SafeContent, { content: q.q, format: q.contentFormat, inline: true })
              ),
              q.options.map((opt, j) =>
                el(
                  'p',
                  {
                    key: j,
                    className: `text-xs ${q.answer === j ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`,
                  },
                  q.answer === j ? "To'g'ri: " : '',
                  LETTERS[j],
                  '. ',
                  el(SafeContent, { content: opt, format: q.contentFormat, inline: true })
                )
              )
            )
          )
        )
      )
  );
}
