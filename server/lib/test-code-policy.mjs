// Maktab registrida kodning noyobligi, versiyasi va bekor qilish qoidalari.
import { randomUUID } from 'node:crypto';
import { codeDigest, encryptTestCode, generateTestCode } from './test-code.mjs';
import { fail } from './http.mjs';
export function allocateCode(registry, schoolId, testId, generate = generateTestCode) {
  for (let index = 0; index < 100; index++) {
    const value = generate(),
      digest = codeDigest(schoolId, value);
    if (registry.reserved[digest]) continue;
    registry.reserved[digest] = testId;
    return {
      id: randomUUID(),
      encrypted: encryptTestCode(schoolId, testId, value),
      digest,
      state: 'inactive',
      version: 1,
      createdAt: new Date().toISOString(),
    };
  }
  fail("Bo'sh test kodi topilmadi. Qayta urinib ko'ring.", 409);
}
export function transitionCode(record, action, expectedVersion) {
  if (!Number.isInteger(expectedVersion) || expectedVersion !== record.version)
    fail("Kod holati o'zgargan. Sahifani yangilang.", 409);
  if (action === 'activate') {
    if (record.state === 'revoked') fail('Bekor qilingan kod faollashtirilmaydi. Yangi kod yarating.', 409);
    if (record.state === 'active') return record;
    return { ...record, state: 'active', version: record.version + 1, activatedAt: new Date().toISOString() };
  }
  if (action === 'revoke') {
    if (record.state === 'revoked') return record;
    return { ...record, state: 'revoked', version: record.version + 1, revokedAt: new Date().toISOString() };
  }
  fail("Kod amali noto'g'ri.");
}
