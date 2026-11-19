// Sahifa o'tish indikatorini va xavfsiz statik havolalar uchun oldindan yuklashni boshqaradi.
const ENTRIES = {
  '/': 'student/landing',
  '/test-kirish': 'student/entry',
  '/eski-testlar': 'student/legacy-tests',
  '/natija': 'student/result',
  '/oqituvchi': 'teacher/dashboard',
  '/oqituvchi/kirish': 'teacher/login',
  '/oqituvchi/sinflar': 'teacher/classes',
  '/oqituvchi/testlar': 'teacher/tests',
  '/oqituvchi/test-tahrir': 'teacher/test-editor',
  '/oqituvchi/natijalar': 'teacher/results',
  '/oqituvchi/savollar-bazasi': 'teacher/library',
  '/oqituvchi/sozlamalar': 'teacher/settings',
  '/bosh-admin': 'super-admin/dashboard',
  '/bosh-admin/umumiy-bank': 'super-admin/bank',
};
const prepared = new Set();
let installed = false,
  progress;
function indicator() {
  if (!progress) {
    progress = document.createElement('div');
    progress.className = 'page-progress';
    progress.hidden = true;
    progress.setAttribute('role', 'status');
    progress.setAttribute('aria-live', 'polite');
    const message = document.createElement('div');
    message.className = 'page-progress-message';
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    message.append(spinner, document.createTextNode('Sahifa yuklanmoqda...'));
    progress.append(message);
    document.body.append(progress);
  }
  return progress;
}
export function showPageLoading() {
  indicator().hidden = false;
}
export function finishPageLoading() {
  if (progress) progress.hidden = true;
}
function target(event) {
  const link = event.target.closest?.('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
  const url = new URL(link.href, location.href);
  if (
    url.origin !== location.origin ||
    url.protocol !== location.protocol ||
    (url.pathname === location.pathname && url.search === location.search)
  )
    return null;
  return url;
}
function prepare(event) {
  if (document.body.classList.contains('exam-running') || navigator.connection?.saveData) return;
  const url = target(event);
  if (!url || prepared.has(url.href) || prepared.size >= 8) return;
  const path = url.pathname.replace(/\/index\.html$|\.html$|\/$/g, '') || '/';
  const entry = ENTRIES[path];
  if (!entry) return;
  prepared.add(url.href);
  const documentHint = document.createElement('link');
  documentHint.rel = 'prefetch';
  documentHint.as = 'document';
  documentHint.href = url.href;
  document.head.append(documentHint);
  const moduleHint = document.createElement('link');
  moduleHint.rel = 'modulepreload';
  moduleHint.href = `/js/${entry}.js`;
  document.head.append(moduleHint);
}
export function installPageFeedback() {
  if (installed) return;
  installed = true;
  document.addEventListener('pointerover', prepare, { passive: true });
  document.addEventListener('focusin', prepare);
  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (target(event)) showPageLoading();
  });
  window.addEventListener('pageshow', finishPageLoading);
  indicator();
}
