// Zaxira, tiklash va tozalash uchun HTTP adapterlar.
import { adminRoute } from '../../lib/route.mjs';
import { fail } from '../../lib/http.mjs';
import { backupData, restoreData, previewRestore, clearData } from '../../services/backup-service.mjs';
import { listBackupArchives, getBackupArchive, backupJobStatus } from '../../services/backup-archive-service.mjs';
export const routes = [
  adminRoute('GET', '/admin/backup', () => backupData()),
  adminRoute('GET', '/admin/backup-archives', () => listBackupArchives()),
  adminRoute('GET', '/admin/backup-status', () => backupJobStatus()),
  adminRoute('GET', '/admin/backup-archives/:id', ({ params }) => getBackupArchive(params.id)),
  adminRoute('POST', '/admin/restore-preview', async ({ body }) => previewRestore(await body())),
  adminRoute('POST', '/admin/restore', async ({ body }) => {
    const request = await body();
    if (typeof request.previewId !== 'string') fail('Avval tiklash previewini oling.');
    return restoreData(request);
  }),
  adminRoute('POST', '/admin/clear', async ({ body }) => clearData(await body())),
];
