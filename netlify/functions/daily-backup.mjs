// Netlify schedule invokes a school-scoped backup and records its status.
import { backupAllSchools } from '../../server/services/backup-archive-service.mjs';
export const config = { schedule: '0 2 * * *' };
export default async function dailyBackup() {
  const result = await backupAllSchools();
  if (result.status !== 'success') console.error('Daily backup incomplete:', result.created, result.failed);
  return new Response(JSON.stringify(result), { status: result.status === 'success' ? 200 : 500 });
}
