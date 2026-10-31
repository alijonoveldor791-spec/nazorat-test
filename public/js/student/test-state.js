// Qurilmadagi urinish va yakuniy natijani saqlashning yagona joyi.
import { storage } from '../core/storage.js';
export const DRAFT_KEY = 'nazorat-attempt-v2';
export const RESULT_KEY = 'nazorat-result-v2';
export const loadAttempt = () => storage.get(DRAFT_KEY);
export const saveAttempt = (state) => storage.set(DRAFT_KEY, state);
export const discardAttempt = () => storage.remove(DRAFT_KEY);
export const loadResult = () => storage.get(RESULT_KEY);
export function finishAttempt(result, state) {
  const saved = storage.set(RESULT_KEY, { result, title: state.title, identity: state.identity });
  if (!saved) throw new Error('Natijani qurilmada saqlab bo’lmadi. Joy bo’shatib, qayta yuboring.');
  discardAttempt();
}
