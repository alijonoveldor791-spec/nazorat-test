// Natijalar sahifasining brauzer kirish nuqtasi.
import { el, mount } from '../core/dom.js';
import { ThemeProvider } from '../components/theme-context.js';
import { ToastProvider } from '../components/toast-context.js';
import { TeacherResultsPage } from './teacher-results-page.js';

mount(
  document.getElementById('app'),
  el(ThemeProvider, null, el(ToastProvider, null, el(TeacherResultsPage)))
);
