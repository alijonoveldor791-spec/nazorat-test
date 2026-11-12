// Saqlangan/tizim mavzusini barcha sahifalarda sinxron va qayta bog'lamasdan qo'llaydi.
import { storage } from './storage.js';
const bound = new WeakSet();
let listening = false;
const systemTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    const label = theme === 'dark' ? "Kunduzgi rejimga o'tish" : "Qorong'i rejimga o'tish";
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}
export function initTheme() {
  const stored = storage.get('nazorat-theme');
  applyTheme(['light', 'dark'].includes(stored) ? stored : systemTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    if (bound.has(button)) return;
    bound.add(button);
    button.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      storage.set('nazorat-theme', theme);
      applyTheme(theme);
    });
  });
  if (listening) return;
  listening = true;
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!['light', 'dark'].includes(storage.get('nazorat-theme'))) applyTheme(systemTheme());
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== 'nazorat-theme' && event.key !== null) return;
    const theme = storage.get('nazorat-theme');
    applyTheme(['light', 'dark'].includes(theme) ? theme : systemTheme());
  });
}
