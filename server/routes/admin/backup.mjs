// Zaxira, tiklash va tozalash uchun HTTP adapterlar.
import { adminRoute } from '../../lib/route.mjs';
import { backupData, restoreData, clearData } from '../../services/backup-service.mjs';
export const routes = [
  adminRoute('GET', '/admin/backup', () => backupData()),
  adminRoute('POST', '/admin/restore', async ({ body }) => restoreData(await body())),
  adminRoute('POST', '/admin/clear', async ({ body }) => clearData(await body())),
];
