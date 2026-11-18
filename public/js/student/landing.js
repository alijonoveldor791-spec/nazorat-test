// Nazorat - Bilimingizni ishonch bilan sinang sahifasining brauzer kirish nuqtasi.
import { el, mount } from '../core/dom.js';
import { ThemeProvider } from '../components/theme-context.js';
import { ToastProvider } from '../components/toast-context.js';
import { LandingPage } from './landing-page.js';

mount(document.getElementById('app'), el(ThemeProvider, null, el(ToastProvider, null, el(LandingPage))));
