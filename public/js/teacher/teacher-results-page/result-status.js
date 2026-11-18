// Topshirish holatlarining nomlari va faqat tanlangan testda ishlaydigan filtrlar.
export const STATUS_OPTIONS = [
  ['submitted', 'Topshirganlar'],
  ['completed', 'Qoidabuzarliksiz topshirganlar'],
  ['with-violations', 'Qoidabuzarlik qayd etilgan'],
  ['terminated', 'Qoidabuzarlik bilan yakunlangan'],
  ['all', 'Barcha ishtirokchilar'],
  ['not-submitted', 'Topshirmaganlar'],
  ['in-progress', 'Davom etayotganlar'],
  ['not-started', 'Boshlamaganlar'],
];
export const needsTest = (status) => ['all', 'not-submitted', 'in-progress', 'not-started'].includes(status);
export { statusLabel } from '../../core/result-status.js';
