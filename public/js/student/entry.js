// O'quvchi wizardining kirishi: mavzu, wizard va tekshirilgan tiklash banneri.
import { initTheme } from '../core/theme.js';
import { mountStudentHeader } from '../components/student-header.js';
import { initWizard } from './entry-wizard.js';
import { initResume } from './entry-session.js';
if (new URLSearchParams(location.search).get('legacy') === '1') {
  location.replace('/eski-testlar.html');
} else {
  mountStudentHeader();
  initTheme();
  initWizard();
  initResume();
}
