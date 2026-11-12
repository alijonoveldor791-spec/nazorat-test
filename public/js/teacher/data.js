// teacher/data.js: sahifaning shu vazifasi uchun modul.
import { call } from './teacher-api.js';
export let data = { classes: [], tests: [], results: [], backups: [] };
export function setResults(results) {
  data = { ...data, results };
  document.dispatchEvent(new Event('teacher:data'));
}
export async function refresh(page) {
  if (page === 'settings') {
    const responses = await Promise.allSettled([
      call('session'),
      call('backup-archives'),
      call('backup-status'),
    ]);
    for (const response of responses)
      if (response.status === 'rejected' && response.reason.status === 401) throw response.reason;
    if (responses[0].status === 'rejected') throw responses[0].reason;
    const session = responses[0].value;
    const archives = responses[1].status === 'fulfilled' ? responses[1].value : null;
    const job = responses[2].status === 'fulfilled' ? responses[2].value : null;
    const backups = Array.isArray(archives) ? archives : [];
    const backupStatus = job && typeof job.status === 'string' ? job : null;
    const backupWarnings = [];
    if (!Array.isArray(archives))
      backupWarnings.push("Zaxira ro'yxatini yuklab bo'lmadi. Yangilash orqali qayta urining.");
    if (!backupStatus)
      backupWarnings.push("Avtomatik zaxira holatini tekshirib bo'lmadi. Yangilash orqali qayta urining.");
    data = {
      ...data,
      role: session.role,
      passwordMinLength: session.passwordMinLength || 6,
      passwordMaxLength: session.passwordMaxLength || 128,
      backups,
      backupStatus,
      backupWarnings,
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
