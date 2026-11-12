// Maktab/test bazasi doirasida har urinish uchun yagona tartib raqamini CAS bilan band qiladi.
import { randomBytes, createHash } from 'node:crypto';
import * as blobs from './blob-store.mjs';
import { fail } from '../lib/http.mjs';
const STORE = 'question-sets';
export async function reserveQuestionSet(key, attemptId, capacity) {
  const participant = createHash('sha256').update(attemptId).digest('hex');
  const seed = randomBytes(32).toString('hex');
  const row = await blobs.update(
    STORE,
    key,
    (previous) => {
      const current = previous || { next: '0', seed, assignments: {} };
      if (Object.hasOwn(current.assignments, participant)) return current;
      const ordinal = BigInt(current.next);
      if (ordinal >= capacity) fail('Turli ketma-ketliklar tugadi. Savollar bazasini kengaytiring.', 409);
      return {
        ...current,
        next: String(ordinal + 1n),
        assignments: { ...current.assignments, [participant]: String(ordinal) },
      };
    },
    { skipUnchanged: true }
  );
  return { ordinal: BigInt(row.assignments[participant]), seed: row.seed };
}
