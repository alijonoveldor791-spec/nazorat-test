// O'qituvchi kabinetiga kirish sahifasining brauzer kirish nuqtasi.
import { el, mount } from '../core/dom.js';
import { ThemeProvider } from '../components/theme-context.js';
import { ToastProvider } from '../components/toast-context.js';
import { AdminLoginPage } from './admin-login-page.js';

mount(document.getElementById('app'), el(ThemeProvider, null, el(ToastProvider, null, el(AdminLoginPage))));
