// Umumiy test kelib chiqishini o'chirish/tiklashdan keyin ham saqlab, snapshot o'zgarishini to'sadi.
import { createHash } from 'node:crypto';
import * as blobs from './blob-store.mjs';
import { questionsValid } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
export async function preserveOrigin(test) {
  let saved = await blobs.get('shared-origins', test.id);
  const fingerprint = () =>
    createHash('sha256')
      .update(JSON.stringify(questionsValid(test.questions)))
      .digest('hex');
  if (!saved && test.origin?.type === 'shared') {
    saved = await blobs.update(
      'shared-origins',
      test.id,
      (old) =>
        old || {
          id: test.id,
          schoolId: test.schoolId,
          origin: test.origin,
          fingerprint: fingerprint(),
        }
    );
  }
  if (!saved) return test;
  if (saved.fingerprint !== fingerprint())
    fail('Umumiy test nusxasining savollarini almashtirish mumkin emas.', 403);
  if (test.settings?.showAnswers) fail('Umumiy testda javoblarni ochish mumkin emas.', 403);
  return { ...test, origin: saved.origin };
}
