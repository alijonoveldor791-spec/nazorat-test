// Yakunlangan urinish natijasini joriy o'qituvchi ruxsati bilan qayta oladi.
import { api } from '../core/api-client.js';
import { storage } from '../core/storage.js';
import { browserKey, RESULT_KEY } from './test-state.js';
export async function refreshResult(saved) {
  if (!saved?.attemptToken) return saved;
  let value;
  try {
    const remote = await api('attempts/resume', {
      method: 'POST',
      body: JSON.stringify({ attemptToken: saved.attemptToken, browserKey: browserKey() }),
    });
    if (!remote.result) throw new Error('Natija topilmadi.');
    value = { ...saved, result: remote.result };
  } catch {
    value = { ...saved, result: { hidden: true, title: saved.title }, refreshFailed: true };
  }
  if (!value.refreshFailed) {
    storage.set(RESULT_KEY, value);
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(value));
    } catch {}
  }
  return value;
}
