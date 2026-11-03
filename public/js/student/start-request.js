// Tasdiqlanmagan startning texnik IDsi reload/retryda saqlanadi; kod va ism yozilmaydi.
import { storage } from '../core/storage.js';
const START_KEY = 'nazorat-start-request-v1';
export async function startRequest(testId, identity) {
  const source = JSON.stringify([
    testId,
    identity.classId,
    identity.name,
    identity.surname,
    identity.browserKey,
    identity.studentCode,
  ]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const fingerprint = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  const previous = storage.get(START_KEY);
  if (previous?.fingerprint === fingerprint && /^[a-f0-9-]{36}$/i.test(previous.requestId))
    return previous.requestId;
  const requestId = crypto.randomUUID();
  if (!storage.set(START_KEY, { fingerprint, requestId }))
    throw new Error("Startni qurilmada saqlab bo'lmadi. Brauzer sozlamalarini tekshiring.");
  return requestId;
}
export const clearStartRequest = () => storage.remove(START_KEY);
