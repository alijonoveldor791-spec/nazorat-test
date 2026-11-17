// Netlify schedule invokes a school-scoped backup and records its status.
import { backupAllSchools } from '../../server/services/backup-archive-service.mjs';
import { env, validateSecurityConfiguration } from '../../server/lib/secret-policy.mjs';
export const config = { schedule: '0 2 * * *' };
export default async function dailyBackup() {
  if (env('STRICT_SECRET_ISOLATION') === 'true') validateSecurityConfiguration();
  const result = await backupAllSchools();
  if (result.status !== 'success') console.error('Daily backup incomplete:', result.created, result.failed);
  return new Response(JSON.stringify(result), { status: result.status === 'success' ? 200 : 500 });
}
