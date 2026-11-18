// Boshqa HTML sahifasiga o'tishda eski sahifaning navbatdagi chizilishini to'xtatadi.
let navigating = false;

export function beginNavigation() {
  navigating = true;
}
export function canRender() {
  return !navigating;
}
