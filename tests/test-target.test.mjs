// Yozadigan integratsiya sinovi production manzilini qabul qilmasligini tekshiradi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const helper = new URL('../scripts/helpers.mjs', import.meta.url).href;
function load(target) {
  return spawnSync(
    process.execPath,
    ['--input-type=module', '-e', `await import(${JSON.stringify(helper)})`],
    {
      env: { ...process.env, TEST_BASE_URL: target },
      encoding: 'utf8',
      timeout: 10000,
    }
  );
}
test('Integratsiya: production URL ma’lumot yozishdan oldin bloklanadi', () => {
  for (const target of ['https://nazorat-test.netlify.app', 'http://localhost.example.com']) {
    const result = load(target);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /faqat localhost/);
  }
});
test('Integratsiya: localhost, IPv4 va IPv6 test serverlariga ruxsat bor', () => {
  for (const target of ['http://localhost:8899', 'http://127.0.0.1:8899', 'http://[::1]:8899'])
    assert.equal(load(target).status, 0);
});
