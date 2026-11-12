// teacher/data.js: sahifaning shu vazifasi uchun modul.
import { call } from './teacher-api.js';
export let data = { classes: [], tests: [], results: [], backups: [] };
export function setResults(results) {
  data = { ...data, results };
  document.dispatchEvent(new Event('teacher:data'));
}
export async function refresh(page) {
  if (page === 'settings') {
    const [session, backups, backupStatus] = await Promise.all([
      call('session'),
      call('backup-archives'),
      call('backup-status'),
    ]);
    data = {
      ...data,
      role: session.role,
      passwordMinLength: session.passwordMinLength || 6,
      passwordMaxLength: session.passwordMaxLength || 128,
      backups,
      backupStatus,
    };
    document.dispatchEvent(new Event('teacher:data'));
    return;
  }
  const needsResults = !page || ['dashboard', 'classes'].includes(page);
  const [classes, tests, results] = await Promise.all([
    call('classes'),
    call('tests'),
    needsResults ? call('results') : Promise.resolve([]),
  ]);
  data = { classes, tests, results };
  document.dispatchEvent(new Event('teacher:data'));
}
