// Qurilmadagi urinish va yakuniy natijani saqlashning yagona joyi.
import { storage } from '../core/storage.js';
import { normalizeAttempt, validResult, validReview } from './draft-validate.js';
export const DRAFT_KEY = 'nazorat-attempt-v2';
export const RESULT_KEY = 'nazorat-result-v2';
export const loadAttempt = () => normalizeAttempt(storage.get(DRAFT_KEY));
export const saveAttempt = (state) => storage.set(DRAFT_KEY, state);
export const discardAttempt = () => storage.remove(DRAFT_KEY);
export const loadResult = () => {
  let value = storage.get(RESULT_KEY);
  if (!value)
    try {
      value = JSON.parse(sessionStorage.getItem(RESULT_KEY));
    } catch {}
  if (value?.result?.review && !validReview(value.result.review)) delete value.result.review;
  return validResult(value) ? value : null;
};
export function browserKey() {
  let key = storage.get('nazorat-browser-key');
  if (typeof key !== 'string' || !/^[a-f0-9-]{32,100}$/i.test(key)) {
    key = crypto.randomUUID();
    if (!storage.set('nazorat-browser-key', key))
      throw new Error('Brauzerda saqlash o’chirilgan. Sozlamalarni tekshiring.');
  }
  return key;
}
export function finishAttempt(result, state) {
  storage.remove(RESULT_KEY);
  let saved = storage.set(RESULT_KEY, { result, title: state.title, identity: state.identity });
  if (!saved)
    try {
      sessionStorage.setItem(
        RESULT_KEY,
        JSON.stringify({ result, title: state.title, identity: state.identity })
      );
      saved = true;
    } catch {}
  if (!saved)
    throw new Error('Serverda natija saqlandi, lekin qurilmaga joy yetmadi. Joy bo’shatib, qayta yuboring.');
  discardAttempt();
}
