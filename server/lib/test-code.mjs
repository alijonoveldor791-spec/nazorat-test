// Umumiy olti raqamli kodni yaratadi va maktab/testga bog'lab shifrlaydi.
import { randomInt, randomBytes, createCipheriv, createDecipheriv, createHmac, hkdfSync } from 'node:crypto';
import { secret } from './env.mjs';
import { fail } from './http.mjs';
const key = (purpose) => Buffer.from(hkdfSync('sha256', secret(), '', 'nazorat-test-code-v1-' + purpose, 32));
const context = (schoolId, testId) => Buffer.from(JSON.stringify([schoolId, testId]));
export const generateTestCode = () => String(randomInt(1_000_000)).padStart(6, '0');
export const codeKeyId = () =>
  createHmac('sha256', key('identity')).update('test-code-registry').digest('hex').slice(0, 24);
export function requireTestCode(value) {
  if (typeof value !== 'string' || !/^[0-9]{6}$/.test(value))
    fail("Test kodi aniq 6 ta raqamdan iborat bo'lishi kerak.");
  return value;
}
export function codeDigest(schoolId, code) {
  return createHmac('sha256', key('lookup'))
    .update(JSON.stringify([schoolId, requireTestCode(code)]))
    .digest('hex');
}
export function encryptTestCode(schoolId, testId, code) {
  requireTestCode(code);
  const iv = randomBytes(12),
    cipher = createCipheriv('aes-256-gcm', key('encryption'), iv);
  cipher.setAAD(context(schoolId, testId));
  const data = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64url'),
    data: data.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
  };
}
export function decryptTestCode(schoolId, testId, encrypted) {
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key('encryption'),
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
    fail("Test kodini o'qib bo'lmadi. Server kalitini tekshiring.", 503);
  }
}
