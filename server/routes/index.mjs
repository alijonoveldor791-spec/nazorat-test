// Yangi HTTP modullarini bitta marshrut ro'yxatiga yig'adi.
import { routes as grades } from './public/grades.mjs';
import { routes as tests } from './public/tests.mjs';
import { routes as submit } from './public/submit.mjs';
import { routes as login } from './admin/login.mjs';
import { routes as classes } from './admin/classes.mjs';
import { routes as adminTests } from './admin/tests.mjs';
import { routes as results } from './admin/results.mjs';
import { routes as analytics } from './admin/analytics.mjs';
import { routes as backup } from './admin/backup.mjs';
import { routes as settings } from './admin/settings.mjs';
import { routes as schools } from './admin/schools.mjs';
import { routes as schoolEntry } from './public/school-entry.mjs';
import { routes as library } from './admin/library.mjs';
export const routes = [
  ...library,
  ...schools,
  ...schoolEntry,
  ...grades,
  ...tests,
  ...submit,
  ...login,
  ...classes,
  ...adminTests,
  ...results,
  ...analytics,
  ...backup,
  ...settings,
];
