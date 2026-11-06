// Production kalitlarini ajratadi; eski fallback faqat aniq lokal opt-in bilan ishlaydi.
import { fail } from './http.mjs';

export const env = (name) => globalThis.Netlify?.env?.get(name) || process.env[name];
export const legacySecretFallbackAllowed = () =>
  env('NETLIFY_DEV') === 'true' && env('ALLOW_LEGACY_SECRET_FALLBACK') === 'true';

function requiredKey(name) {
  const value = env(name);
  if (typeof value !== 'string' || value.trim().length < 32)
    fail(`${name} kamida 32 belgili alohida maxfiy kalit bilan sozlansin.`, 503);
  return value;
}

export const secret = () => requiredKey('TOKEN_SECRET');
function dedicatedKey(name) {
  const value = env(name);
  if (!value && legacySecretFallbackAllowed()) return secret();
  return requiredKey(name);
}
export const adminSessionSecret = () => dedicatedKey('ADMIN_SESSION_SECRET');
export const testCodeEncryptionKey = () => dedicatedKey('TEST_CODE_ENCRYPTION_KEY');
export const testCodeLookupKey = () => dedicatedKey('TEST_CODE_LOOKUP_KEY');

export function validateSecurityConfiguration() {
  const keys = {
    TOKEN_SECRET: secret(),
    ADMIN_SESSION_SECRET: adminSessionSecret(),
    TEST_CODE_ENCRYPTION_KEY: testCodeEncryptionKey(),
    TEST_CODE_LOOKUP_KEY: testCodeLookupKey(),
  };
  for (const name of ['ADMIN_SESSION_PREVIOUS_SECRET', 'TEST_CODE_ENCRYPTION_KEY_PREVIOUS'])
    if (env(name)) requiredKey(name);
  if (legacySecretFallbackAllowed()) return;
  const names = Object.keys(keys);
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      const left = names[i],
        right = names[j];
      if (keys[left] !== keys[right]) continue;
      // Eski registry digestlarini saqlash uchun operatorning vaqtinchalik ko'prigi.
      if (
        left === 'TOKEN_SECRET' &&
        right === 'TEST_CODE_LOOKUP_KEY' &&
        env('ALLOW_LEGACY_LOOKUP_KEY') === 'true'
      )
        continue;
      fail(`${left} va ${right} alohida kalitlar bo'lishi kerak.`, 503);
    }
}
