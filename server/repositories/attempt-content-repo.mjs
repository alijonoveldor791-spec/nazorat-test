// Urinishning boy savol snapshotini bir marta saqlaydi; draft holatidan ajratadi.
import { hash } from '../lib/identity.mjs';
import * as blobs from './blob-store.mjs';
const STORE = 'attempt-content';
export async function reserve(row) {
  const ref = row.id + '/' + hash(JSON.stringify(row.questions));
  await blobs.create(STORE, ref, {
    id: ref,
    ...(row.schoolId ? { schoolId: row.schoolId } : {}),
    questions: row.questions,
  });
  return ref;
}
export function compact(row, ref) {
  const { questions, ...state } = row;
  return { ...state, contentRef: ref, questionShape: questions.map((q) => q.options.length) };
}
export async function hydrate(row) {
  if (!row || !row.contentRef) return row;
  const content = await blobs.get(STORE, row.contentRef);
  if (!content) throw new Error('Urinish savollari snapshoti topilmadi.');
  return { ...row, questions: content.questions };
}
export const clear = () => blobs.clearStore(STORE);
