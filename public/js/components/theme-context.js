// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../core/dom.js';
import {
  createScope as createContext,
  readScope as useContext,
  effect as useEffect,
  state as useState,
} from '../core/state.js';
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});
const STORAGE_KEY = 'nazorat-theme';
function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    const raw = stored ? JSON.parse(stored) : null;
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setTheme(getInitialTheme());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  return el(ThemeContext.Provider, { value: { theme, toggleTheme } }, children);
}
export function useTheme() {
  return useContext(ThemeContext);
}
