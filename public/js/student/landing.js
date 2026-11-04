// Bosh sahifa mavzusi va mavjud server tekshiruvli davom etish kartasini ulaydi.
import { initTheme } from '../core/theme.js';
import { initResume } from './entry-session.js';
const params = new URLSearchParams(location.search);
if (params.get('legacy') === '1') {
  location.replace('/eski-testlar.html');
} else if (params.has('schoolId')) {
  location.replace('/test-kirish.html?' + params.toString());
} else {
  initTheme();
  initResume();
}
