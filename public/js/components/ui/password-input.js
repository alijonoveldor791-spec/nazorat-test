// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../../core/dom.js';
import { uniqueId as useId, state as useState } from '../../core/state.js';
import { Eye, EyeOff } from '../icons.js';
export function PasswordInput({ label, id, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = id || autoId;
  return el(
    'div',
    { className: 'space-y-1.5' },
    el(
      'label',
      { htmlFor: inputId, className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' },
      label
    ),
    el(
      'div',
      { className: 'relative' },
      el('input', {
        id: inputId,
        type: visible ? 'text' : 'password',
        className: `w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`,
        ...props,
      }),
      el(
        'button',
        {
          type: 'button',
          onClick: () => setVisible((v) => !v),
          'aria-label': visible ? 'Parolni berkitish' : "Parolni ko'rsatish",
          'aria-pressed': visible,
          className:
            'absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
        },
        visible ? el(EyeOff, { className: 'h-4 w-4' }) : el(Eye, { className: 'h-4 w-4' })
      )
    )
  );
}
