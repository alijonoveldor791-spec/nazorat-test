// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../core/dom.js';
import {
  createScope as createContext,
  callback as useCallback,
  readScope as useContext,
  state as useState,
} from '../core/state.js';
import { AlertCircle, CheckCircle2, X } from './icons.js';
const ToastContext = createContext({ toast: () => {} });
let nextId = 1;
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);
  const toast = useCallback((message, isError = false) => {
    const id = nextId++;
    setItems((prev) => [...prev.slice(-3), { id, message, isError }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);
  return el(
    ToastContext.Provider,
    { value: { toast } },
    children,
    el(
      'div',
      {
        'aria-live': 'polite',
        className: 'pointer-events-none fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2',
      },
      items.map((item) =>
        el(
          'div',
          {
            key: item.id,
            role: item.isError ? 'alert' : 'status',
            className: `pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              item.isError
                ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100'
                : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            }`,
          },
          item.isError
            ? el(AlertCircle, { className: 'mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400' })
            : el(CheckCircle2, {
                className: 'mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400',
              }),
          el('span', { className: 'flex-1 leading-snug' }, item.message),
          el(
            'button',
            {
              type: 'button',
              onClick: () => dismiss(item.id),
              'aria-label': 'Yopish',
              className: 'rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            },
            el(X, { className: 'h-3.5 w-3.5' })
          )
        )
      )
    )
  );
}
export function useToast() {
  return useContext(ToastContext);
}
