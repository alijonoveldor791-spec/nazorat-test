// Natijaga berilgan bitta qo'shimcha ruxsatning noaniq javobini xavfsiz qayta yuboradi.
import { storage } from '../core/storage.js';
import { post } from './teacher-api.js';
export async function grantRetake(id) {
  const key = 'nazorat-retake-' + id;
  let requestId = storage.get(key);
  if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) {
    requestId = crypto.randomUUID();
    if (!storage.set(key, requestId)) throw new Error("Ruxsat so'rovini saqlab bo'lmadi. Qayta tekshiring.");
  }
  await post('results/' + id + '/retake', { requestId });
  storage.remove(key);
}
