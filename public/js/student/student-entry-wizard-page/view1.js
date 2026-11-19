// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { CheckCircle2 } from '../../components/icons.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'space-y-4' },
    el(
      'div',
      null,
      el(
        'label',
        {
          htmlFor: 'public-school-id',
          className: 'block text-sm font-medium text-slate-700 dark:text-slate-200',
        },
        'Maktab IDsi'
      ),
      el('input', {
        id: 'public-school-id',
        value: scope.schoolId,
        onChange: (e) => scope.handleCodeChange(e.target.value, scope.testCode),
        placeholder: 'Masalan: SK-1001',
        maxLength: 40,
        autoComplete: 'off',
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-base uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'div',
      null,
      el(
        'label',
        { htmlFor: 'test-code', className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' },
        '6 raqamli test kodi'
      ),
      el('input', {
        id: 'test-code',
        value: scope.testCode,
        onChange: (e) =>
          scope.handleCodeChange(scope.schoolId, e.target.value.replace(/\D/g, '').slice(0, 6)),
        inputMode: 'numeric',
        maxLength: 6,
        placeholder: '000000',
        autoComplete: 'off',
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xl font-semibold tracking-[0.35em] tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    scope.resolved
      ? el(
          'div',
          {
            className:
              'flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
          },
          el(CheckCircle2, { className: 'mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400' }),
          el(
            'div',
            null,
            el('p', { className: 'font-semibold' }, scope.resolved.test.title),
            el(
              'p',
              { className: 'mt-0.5 text-xs opacity-90' },
              scope.resolved.school.name,
              ' \u00B7 ',
              scope.resolved.school.public_school_id,
              ' \u00B7',
              ' ',
              scope.resolved.test.count,
              ' ta savol'
            )
          )
        )
      : el(
          'button',
          {
            type: 'button',
            disabled: scope.busy,
            onClick: scope.handleResolve,
            className:
              'w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
          },
          scope.busy ? 'Tekshirilmoqda...' : 'Kodlarni tekshirish'
        )
  );
}
