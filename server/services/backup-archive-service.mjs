// Avtomatik maktab nusxalari, yuklab olish va bajarilish holatini boshqaradi.
import { randomUUID } from 'node:crypto';
import { runWithAccess } from '../lib/access-context.mjs';
import { fail } from '../lib/http.mjs';
import { validId } from '../lib/backup-validate.mjs';
import * as archives from '../repositories/backup-archives-repo.mjs';
import * as audit from '../repositories/audit-repo.mjs';
import * as jobs from '../repositories/backup-jobs-repo.mjs';
import * as schools from '../repositories/schools-repo.mjs';
import { backupData } from './backup-service.mjs';

async function recordFailure(scope) {
  await audit.append(randomUUID(), {
    at: new Date().toISOString(), action: 'backup.scheduled', actorId: 'scheduled-backup',
    schoolId: scope.schoolId || null, objectId: null, outcome: 'failure',
  });
}
export async function backupAllSchools() {
  const startedAt = new Date().toISOString();
  await jobs.save('latest', { startedAt, status: 'running' });
  const scopes = [...(await schools.list(true)).map((school) => ({ role: 'school_admin', schoolId: school.id })),
    { role: 'legacy_admin' }];
  let created = 0, failed = 0;
  for (const scope of scopes) {
    try {
      await runWithAccess({ ...scope, accountLogin: 'scheduled-backup' }, async () => {
        const data = await backupData(), id = randomUUID();
        await archives.save(id, { id, createdAt: new Date().toISOString(), source: 'scheduled', schoolId: scope.schoolId || null, data });
      });
      created++;
    } catch {
      failed++;
      await recordFailure(scope);
    }
    await jobs.save('latest', { startedAt, updatedAt: new Date().toISOString(), status: 'running', created, failed });
  }
  const result = { startedAt, finishedAt: new Date().toISOString(), status: failed ? 'partial' : 'success', created, failed };
  await jobs.save('latest', result);
  return result;
}
export const backupJobStatus = () => jobs.find('latest');
export async function listBackupArchives() {
  return (await archives.list()).map(({ id, createdAt, source }) => ({ id, createdAt, source: source || 'restore-safety' }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
}
export async function getBackupArchive(id) {
  const row = await archives.find(validId(id));
  if (!row) fail('Zaxira topilmadi.', 404);
  return row.data;
}
