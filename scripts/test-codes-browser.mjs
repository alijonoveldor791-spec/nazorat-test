// A bosqichi: haqiqiy lokal UI/API orqali kod yaratish, reload, nusxalash va holatlar.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { base, request, artifact } from './helpers.mjs';
const credentials = JSON.parse(readFileSync('.local/roles-dev.json', 'utf8').replace(/^\uFEFF/, ''));
const suffix = randomBytes(5).toString('hex'),
  password = randomBytes(6).toString('hex');
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
});
const errors = [],
  logs = [];
const pass = (message) => {
  logs.push(message);
  console.log('PASS:', message);
};
mkdirSync('artifacts', { recursive: true });
let root, token;
try {
  root = (await request('admin/login', { method: 'POST', body: credentials })).token;
  const school = await request('super-admin/schools', {
    token: root,
    method: 'POST',
    body: { name: 'QA code A ' + suffix },
    expected: 201,
  });
  await request(`super-admin/schools/${school.id}/admin`, {
    token: root,
    method: 'POST',
    body: { login: 'qa-code-' + suffix, password },
    expected: 201,
  });
  token = (await request('admin/login', { method: 'POST', body: { login: 'qa-code-' + suffix, password } }))
    .token;
  const cls = await request('admin/classes', { token, method: 'POST', body: { name: '7-A' }, expected: 201 });
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/oqituvchi/kirish.html');
  await page.locator('#admin-login').fill('qa-code-' + suffix);
  await page.locator('#pw').fill(password);
  await page.locator('#enter').click();
  await page.waitForURL('**/oqituvchi/index.html');
  await page.goto(base + '/oqituvchi/test-tahrir.html');
  await page.locator('#edit-title').fill('Kodli test ' + suffix);
  await page.locator('#edit-subject').fill('Matematika');
  await page.locator(`[name=classIds][value="${cls.id}"]`).check();
  await page.locator('#import-file').setInputFiles('samples/namuna-test.txt');
  await expect(page.locator('#import-text')).toHaveValue(/ANSWER:/);
  await page.locator('#preview').click();
  await page.locator('[data-question="19"]').waitFor();
  await page.locator('[data-confirm]').click();
  await page.waitForURL('**/oqituvchi/testlar.html');
  const record = (await request('admin/tests', { token })).find(
    (row) => row.title === 'Kodli test ' + suffix
  );
  assert(record);
  const card = page.locator(`[data-test-id="${record.id}"]`);
  await expect(card.locator('[data-test-code]')).toHaveText(/^[0-9]{6}$/);
  const code = await card.locator('[data-test-code]').innerText();
  await expect(card).toContainText('Matematika');
  pass('Test UI orqali yaratildi; API va kartada umumiy 6 raqamli kod ko‘rindi.');
  await page.reload();
  await expect(card.locator('[data-test-code]')).toHaveText(code);
  assert.equal((await request('admin/tests/' + record.id, { token })).testCode.value, code);
  pass('Reload va alohida API o‘qishida kod bazadan aynan qaytdi.');
  await card.locator('[data-action=copy-test-code]').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), code);
  pass('Nusxalash haqiqiy clipboardga to‘g‘ri kodni yozdi.');
  await card.locator('[data-action=activate-test-code]').click();
  await expect(card.locator('[aria-label="Umumiy test kodi"]')).toContainText('Faol');
  assert.equal((await request('admin/tests/' + record.id, { token })).testCode.state, 'active');
  await card.locator('[data-action=toggle-test]').click();
  await expect(card).toContainText("To'xtatilgan");
  await expect(card.locator('[data-test-code]')).toHaveText(code);
  await card.locator('[data-action=toggle-test]').click();
  pass('Kod faollashtirildi; testni to‘xtatish/qayta ochish kodni almashtirmadi.');
  await page.goto(base + '/oqituvchi/test-tahrir.html?id=' + record.id);
  await page.locator('#edit-title').fill('Tahrirlangan kodli test ' + suffix);
  await page.locator('[data-confirm]').click();
  await page.waitForURL('**/oqituvchi/testlar.html');
  await expect(card.locator('[data-test-code]')).toHaveText(code);
  pass('Testni tahrirlash va saqlash kodni saqladi.');
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/test-codes-${width}.png`, fullPage: true });
  }
  pass('Kodli kartalar 320/390/1280 px ekranlarda sig‘di.');
  await card.locator('[data-action=revoke-test-code]').click();
  await expect(page.locator('dialog')).toContainText('Boshlangan urinishlar');
  await page.locator('dialog [data-confirm]').click();
  await expect(card.locator('[aria-label="Umumiy test kodi"]')).toContainText('Bekor qilingan');
  assert.equal((await request('admin/tests/' + record.id, { token })).testCode.state, 'revoked');
  await card.locator('[data-action=replace-test-code]').click();
  await page.locator('dialog [data-confirm]').click();
  await expect(card.locator('[data-test-code]')).not.toHaveText(code);
  const replacement = (await request('admin/tests/' + record.id, { token })).testCode;
  assert.equal(replacement.state, 'inactive');
  pass('Bekor qilish va yangi nofaol kodga almashtirish bazada saqlandi.');
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error('QA clipboard denied');
    };
  });
  await card.locator('[data-action=copy-test-code]').click();
  await expect(page.locator('.toasts')).toContainText('Nusxalanmadi');
  await expect(card.locator('[data-test-code]')).toHaveText(replacement.value);
  assert.deepEqual(errors, []);
  pass('Clipboard rad etilishi tushuntirildi; kod yo‘qolmadi va 0 JS xato.');
  artifact('test-codes-browser.json', { passed: logs.length, logs, errors });
  await context.close();
} finally {
  for (const value of [root, token].filter(Boolean))
    await request('admin/logout', { token: value, method: 'POST' }).catch(() => {});
  await browser.close();
}
