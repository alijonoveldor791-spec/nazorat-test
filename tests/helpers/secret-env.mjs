// Kalit siyosati testida faqat process-local sintetik qiymatlar o'rnatadi va tiklaydi.
import { randomUUID } from 'node:crypto';

export const SECRET_NAMES = [
  'TOKEN_SECRET',
  'ADMIN_SESSION_SECRET',
  'TEST_CODE_ENCRYPTION_KEY',
  'TEST_CODE_LOOKUP_KEY',
  'ADMIN_SESSION_PREVIOUS_SECRET',
  'TEST_CODE_ENCRYPTION_KEY_PREVIOUS',
  'NETLIFY_DEV',
  'ALLOW_LEGACY_SECRET_FALLBACK',
  'ALLOW_LEGACY_LOOKUP_KEY',
];
export function secretEnvironment(t) {
  const previous = Object.fromEntries(SECRET_NAMES.map((name) => [name, process.env[name]]));
  const current = Object.fromEntries(
    SECRET_NAMES.slice(0, 4).map((name) => [name, randomUUID() + randomUUID()])
  );
  const reset = () => {
    for (const name of SECRET_NAMES) delete process.env[name];
    Object.assign(process.env, current);
  };
  reset();
  t.after(() => {
    for (const name of SECRET_NAMES)
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
  });
  return { current, reset };
}
