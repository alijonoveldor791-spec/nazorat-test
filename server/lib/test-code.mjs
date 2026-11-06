// Umumiy olti raqamli kodni yaratadi va maktab/testga bog'lab shifrlaydi.
import { randomInt, randomBytes, createCipheriv, createDecipheriv, createHmac, hkdfSync } from 'node:crypto';
import {
  env,
  secret,
  legacySecretFallbackAllowed,
  testCodeLookupKey,
  testCodeEncryptionKey,
} from './secret-policy.mjs';
import { fail } from './http.mjs';
const key = (purpose, source) =>
  Buffer.from(hkdfSync('sha256', source, '', 'nazorat-test-code-v1-' + purpose, 32));
const context = (schoolId, testId) => Buffer.from(JSON.stringify([schoolId, testId]));
export const generateTestCode = () => String(randomInt(1_000_000)).padStart(6, '0');
export const codeKeyId = () =>
  createHmac('sha256', key('identity', testCodeLookupKey()))
    .update('test-code-registry')
    .digest('hex')
    .slice(0, 24);
export const testCodeEncryptionKeyId = (source = testCodeEncryptionKey()) =>
  createHmac('sha256', key('encryption', source)).update('test-code-encryption').digest('hex').slice(0, 24);
export function requireTestCode(value) {
  if (typeof value !== 'string' || !/^[0-9]{6}$/.test(value))
    fail("Test kodi aniq 6 ta raqamdan iborat bo'lishi kerak.");
  return value;
}
export function codeDigest(schoolId, code) {
  return createHmac('sha256', key('lookup', testCodeLookupKey()))
    .update(JSON.stringify([schoolId, requireTestCode(code)]))
    .digest('hex');
}
export function encryptTestCode(schoolId, testId, code) {
  requireTestCode(code);
  const encryptionKey = testCodeEncryptionKey();
  const iv = randomBytes(12),
    cipher = createCipheriv('aes-256-gcm', key('encryption', encryptionKey), iv);
  cipher.setAAD(context(schoolId, testId));
  const data = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64url'),
    data: data.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    keyVersion: env('TEST_CODE_ENCRYPTION_KEY') ? 2 : 1,
    keyId: testCodeEncryptionKeyId(encryptionKey),
  };
}
export function decryptTestCode(schoolId, testId, encrypted) {
  const keys =
    encrypted.keyVersion === 2
      ? [testCodeEncryptionKey(), env('TEST_CODE_ENCRYPTION_KEY_PREVIOUS')].filter(Boolean)
      : [
          env('TEST_CODE_ENCRYPTION_KEY_PREVIOUS'),
          ...(legacySecretFallbackAllowed() ? [secret()] : []),
        ].filter(Boolean);
  for (const source of keys.filter(
    (item) => !encrypted.keyId || testCodeEncryptionKeyId(item) === encrypted.keyId
  ))
    try {
      if (source.length < 32) continue;
      const decipher = createDecipheriv(
        'aes-256-gcm',
        key('encryption', source),
        Buffer.from(encrypted.iv, 'base64url')
      );
      decipher.setAAD(context(schoolId, testId));
      decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64url'));
      return requireTestCode(
        Buffer.concat([decipher.update(Buffer.from(encrypted.data, 'base64url')), decipher.final()]).toString(
          'utf8'
        )
      );
    } catch {
      /* Keyingi mos kalitni sinaydi; maxfiy matnni xatoga qo'shmaydi. */
    }
  fail("Test kodini o'qib bo'lmadi. Server kalitini tekshiring.", 503);
}
