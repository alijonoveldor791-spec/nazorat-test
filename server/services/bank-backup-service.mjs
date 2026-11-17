// Ochiq zaxira va natija tafsiloti orqali umumiy bank fayl/kalit ruxsatlari chetlab o'tilishini to'sadi.
import { requireOrigin } from './bank-policy-service.mjs';
import * as tests from '../repositories/tests-repo.mjs';
export async function guardBackupExport(backup) {
  for (const test of backup.tests || []) {
    for (const action of ['docx', 'pdf', 'key']) await requireOrigin(test, action);
  }
  for (const result of backup.results || []) {
    for (const action of ['docx', 'pdf', 'key']) await requireOrigin(result, action);
  }
  return backup;
}
export async function guardResultDetail(result) {
  await requireOrigin(result, 'key');
  const test = await tests.find(result.testId);
  if (test) await requireOrigin(test, 'key');
  return result;
}
