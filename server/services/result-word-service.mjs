// Faqat admin egaligi tekshirilgan yakuniy natijani Word fayliga aylantiradi.
import { findResult } from './result-service.mjs';
import { guardResultDetail } from './bank-backup-service.mjs';
import { requireOrigin } from './bank-policy-service.mjs';
import { buildResultWord, resultWordFilename } from '../lib/result-word.mjs';
export async function exportResultWord(id) {
  const result = await findResult(id);
  await requireOrigin(result, 'docx');
  await requireOrigin(result, 'key');
  await guardResultDetail(result);
  return { bytes: buildResultWord(result), filename: resultWordFilename(result) };
}
