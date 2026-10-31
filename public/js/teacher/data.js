// teacher/data.js: sahifaning shu vazifasi uchun modul.
import { call } from './teacher-api.js';
export let data = { classes: [], tests: [], results: [] };
export async function refresh(page) {
  if (page === 'settings') {
    await call('session');
    document.dispatchEvent(new Event('teacher:data'));
    return;
  }
  const needsResults = !page || ['dashboard', 'classes', 'results'].includes(page);
  const [classes, tests, results] = await Promise.all([
    call('classes'),
    call('tests'),
    needsResults ? call('results') : Promise.resolve([]),
  ]);
  data = { classes, tests, results };
  document.dispatchEvent(new Event('teacher:data'));
}
