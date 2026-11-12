// Faqat admin egaligi tekshirilgan yakuniy natijani Word fayliga aylantiradi.
import { findResult } from './result-service.mjs';
import { buildResultWord, resultWordFilename } from '../lib/result-word.mjs';
export async function exportResultWord(id) {
  const result = await findResult(id);
  return { bytes: buildResultWord(result), filename: resultWordFilename(result) };
}
