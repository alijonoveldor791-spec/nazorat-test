// core/theme.js: sahifaning shu vazifasi uchun modul.
import { storage } from './storage.js';
export function initTheme() {
  const theme = storage.get('nazorat-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const dark =
        document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
      document.documentElement.dataset.theme = dark ? 'light' : 'dark';
      storage.set('nazorat-theme', dark ? 'light' : 'dark');
    });
  });
}
