// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el, fragment } from '../../core/dom.js';
import { effect as useEffect } from '../../core/state.js';
import { X } from '../icons.js';
const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};
export function Modal({ open, onClose, title, subtitle, size = 'md', children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return el(
    'div',
    {
      className: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'modal-title',
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
    },
    el(
      'div',
      {
        className: `flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 ${SIZE_CLASSES[size]}`,
      },
      el(
        'div',
        {
          className:
            'flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800',
        },
        el(
          'div',
          { className: 'min-w-0' },
          el('h2', { id: 'modal-title', className: 'text-lg font-semibold tracking-tight' }, title),
          subtitle && el('p', { className: 'mt-0.5 text-sm text-slate-500 dark:text-slate-400' }, subtitle)
        ),
        el(
          'button',
          {
            type: 'button',
            onClick: onClose,
            'aria-label': 'Oynani yopish',
            className:
              'rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
          },
          el(X, { className: 'h-5 w-5' })
        )
      ),
      el('div', { className: 'flex-1 overflow-y-auto px-6 py-5' }, children),
      footer &&
        el(
          'div',
          {
            className:
              'flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-950/40',
          },
          footer
        )
    )
  );
}
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmLabel = 'Tasdiqlash',
  cancelLabel = 'Bekor qilish',
  danger = false,
  loading = false,
}) {
  return el(
    Modal,
    {
      open: open,
      onClose: () => !loading && onClose(),
      title: title,
      size: 'sm',
      footer: el(
        fragment,
        null,
        el(
          'button',
          {
            type: 'button',
            disabled: loading,
            onClick: onClose,
            className:
              'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
          },
          cancelLabel
        ),
        el(
          'button',
          {
            type: 'button',
            disabled: loading,
            onClick: onConfirm,
            className: `rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
            }`,
          },
          loading ? 'Bajarilmoqda...' : confirmLabel
        )
      ),
    },
    el(
      'p',
      { className: 'text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
      description ?? message ?? ''
    )
  );
}
