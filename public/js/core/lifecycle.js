// Boshqa HTML sahifasiga o'tishda eski sahifaning navbatdagi chizilishini to'xtatadi.
import { showPageLoading, finishPageLoading } from './page-loading.js';
let navigating = false;

export function beginNavigation() {
  navigating = true;
  showPageLoading();
}
window.addEventListener('pageshow', () => {
  navigating = false;
  finishPageLoading();
});
export function canRender() {
  return !navigating;
}
