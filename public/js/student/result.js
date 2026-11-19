// Test natijasi sahifasining brauzer kirish nuqtasi.
import { el, mount } from '../core/dom.js';
import { ThemeProvider } from '../components/theme-context.js';
import { ToastProvider } from '../components/toast-context.js';
import { ResultPage } from './result-page.js';

mount(document.getElementById('app'), el(ThemeProvider, null, el(ToastProvider, null, el(ResultPage))));
