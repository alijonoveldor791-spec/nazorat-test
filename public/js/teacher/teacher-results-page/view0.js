// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { BarChart3, Download, FileSpreadsheet, Printer } from '../../components/icons.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2 no-print' },
    el(
      'button',
      {
        type: 'button',
        className: 'results-secondary',
        disabled: scope.loading,
        onClick: () => scope.refresh(),
      },
      'Yangilash'
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: scope.openAnalysis,
        disabled: scope.analysisBusy || !scope.testId,
        title: scope.testId ? "Tanlangan filtrlar bo'yicha tahlil" : 'Avval testni tanlang',
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      },
      el(BarChart3, { className: 'h-3.5 w-3.5' }),
      el('span', null, scope.analysisBusy ? 'Yuklanmoqda...' : 'Savollar tahlili')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleExport(false),
        disabled: scope.exportBusy,
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      },
      el(Download, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'CSV')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleExport(true),
        disabled: scope.exportBusy,
        className:
          'inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap',
      },
      el(FileSpreadsheet, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Excel (.xlsx)')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: scope.handlePrint,
        disabled: scope.exportBusy,
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      },
      el(Printer, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Chop etish')
    )
  );
}
