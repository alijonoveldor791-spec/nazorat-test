// helpers: lokal tekshiruv uchun yordamchi.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseAiken } from '../server/lib/aiken-parser.mjs';
if (existsSync('.env')) process.loadEnvFile('.env');
export const base = process.env.TEST_BASE_URL || 'http://localhost:8888';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname))
  throw new Error(
    'Ma’lumot yozadigan sinovlar faqat localhost uchun. Jonli saytni test:deploy bilan tekshiring.'
  );
const BROWSER_KEY = crypto.randomUUID();
const TOKEN_KEYS = new Map();
export async function request(path, { token, method = 'GET', body, expected = 200 } = {}) {
  if (body && (/tests\/[^/]+\/start$/.test(path) || body.attemptToken))
    body = { ...body, browserKey: body.browserKey ?? TOKEN_KEYS.get(body.attemptToken) ?? BROWSER_KEY };
  const response = await fetch(base + '/api/' + path, {
    method,
    headers: {
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!(Array.isArray(expected) ? expected.includes(response.status) : response.status === expected))
    throw new Error(`${method} ${path}: ${response.status} ${data.error || ''}`);
  if (data.attemptToken) TOKEN_KEYS.set(data.attemptToken, body?.browserKey);
  return data;
}
export async function admin() {
  if (!process.env.TEACHER_PASSWORD) throw new Error('TEACHER_PASSWORD kerak.');
  return (await request('admin/login', { method: 'POST', body: { password: process.env.TEACHER_PASSWORD } }))
    .token;
}
export const sample = () => parseAiken(readFileSync('samples/namuna-test.txt', 'utf8'));
export async function fixture(token, settings = {}, roster = '') {
  const cls = await request('admin/classes', {
    token,
    method: 'POST',
    body: { name: 'Sinov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), roster },
    expected: 201,
  });
  const test = await request('admin/tests', {
    token,
    method: 'POST',
    body: {
      title: 'Sinov testi',
      classIds: [cls.id],
      questions: sample(),
      settings: { maxAttempts: 2, ...settings },
    },
    expected: 201,
  });
  return { cls, test };
}
export async function cleanup(token, cls, test) {
  for (const r of await request('admin/results', { token }))
    if (r.testId === test?.id) await request('admin/results/' + r.id, { token, method: 'DELETE' });
  if (test) await request('admin/tests/' + test.id, { token, method: 'DELETE' });
  if (cls) await request('admin/classes/' + cls.id, { token, method: 'DELETE' });
}
export function artifact(name, value) {
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/' + name, JSON.stringify(value, null, 2));
}
