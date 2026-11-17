// Savollar bazasi amallari uchun tashqi kutubxonasiz SVG belgilar.
const PATHS = {
  upload: '<path d="M14 2H6v20h12V6zM14 2v5h5M12 17v-6m-3 3 3-3 3 3"/>',
  docx: '<path d="M14 2H6v20h12V6zM14 2v5h5M9 11h6M9 15h6"/>',
  pdf: '<path d="M6 9V2h12v7M6 17H3V9h18v8h-3M6 14h12v8H6z"/>',
  key: '<circle cx="16" cy="7" r="4"/><path d="m13 10-10 10h4v-3h3v-3l3-1"/>',
  publish: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  share:
    '<circle cx="5" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8 10 7-4M8 14l7 4"/>',
  delete: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  prompt: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m6 9 3 3-3 3m6 0h5"/>',
  inspect: '<path d="M14 2H6v20h12V6zM14 2v5h5M9 11h6M9 15h6"/>',
};
export function libraryIcon(action) {
  const path = PATHS[action];
  return path
    ? `<svg class="library-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`
    : '';
}
