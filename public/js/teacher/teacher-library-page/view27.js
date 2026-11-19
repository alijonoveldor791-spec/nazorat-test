// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Modal } from '../../components/ui/modal.js';
import { copyToClipboard } from '../../core/format.js';
export function view27(scope) {
  return el(
    Modal,
    {
      open: Boolean(scope.publishedCode),
      onClose: () => scope.setPublishedCode(null),
      title: 'Test kodi yaratildi',
    },
    scope.publishedCode &&
      el(
        'div',
        { className: 'space-y-4 text-center' },
        el(
          'p',
          { className: 'text-sm text-slate-600 dark:text-slate-300' },
          "O'quvchilar maktab IDsi va ushbu kod orqali kiradi:"
        ),
        el(
          'p',
          { className: 'font-mono text-3xl font-bold tracking-widest text-slate-900 dark:text-white' },
          scope.publishedCode
        ),
        el(
          'button',
          {
            type: 'button',
            onClick: async () => {
              const ok = await copyToClipboard(scope.publishedCode);
              scope.toast(ok ? 'Kod nusxalandi.' : 'Nusxalanmadi.', !ok);
            },
            className:
              'rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700',
          },
          'Kodni nusxalash'
        )
      )
  );
}
