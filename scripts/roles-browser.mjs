// Faqat lokal serverda bosh admin va maktab admini UI/API izolyatsiyasini tekshiradi.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { base, request, artifact } from './helpers.mjs';
const credentials = JSON.parse(readFileSync('.local/roles-dev.json', 'utf8').replace(/^\uFEFF/, ''));
const password = randomBytes(6).toString('hex');
const suffix = randomBytes(5).toString('hex');
const logs = [],
  errors = [];
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
});
const pass = (message) => {
  logs.push(message);
  console.log('PASS:', message);
};
const contexts = [];
mkdirSync('artifacts', { recursive: true });
let root, tokenA, tokenB;
try {
  const context = await browser.newContext();
  contexts.push(context);
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/oqituvchi/kirish.html');
  await page.locator('#admin-login').fill(credentials.login);
  await page.locator('#pw').fill(credentials.password);
  await page.locator('#enter').click();
  await page.waitForURL('**/bosh-admin/index.html');
  root = await page.evaluate(() => sessionStorage.getItem('nazorat-token'));
  await page.locator('#school-name').fill('QA roles A ' + suffix);
  await page.locator('#school-form button').click();
  await expect(page.locator('#schools')).toContainText('QA roles A ' + suffix);
  const schoolA = (await request('super-admin/schools', { token: root })).find(
    (row) => row.name === 'QA roles A ' + suffix
  );
  assert(schoolA);
  pass('Bosh admin loginidan panelga o‘tdi va UI orqali maktab yaratdi.');
  const form = page.locator(`form[data-kind=admin][data-id="${schoolA.id}"]`);
  await form.locator('[name=login]').fill('qa-a-' + suffix);
  await form.locator('[name=password]').fill(password);
  await form.locator('button').click();
  await expect(page.locator('#schools')).toContainText('Admin: qa-a-' + suffix);
  pass('Bosh admin maktabga bitta login/parolli admin tayinladi.');
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/roles-super-${width}.png`, fullPage: true });
  }
  pass('Bosh admin paneli 320/390/1280 px kengliklarda sig‘di.');
  const schoolB = await request('super-admin/schools', {
    token: root,
    method: 'POST',
    body: { name: 'QA roles B ' + suffix },
    expected: 201,
  });
  await request(`super-admin/schools/${schoolB.id}/admin`, {
    token: root,
    method: 'POST',
    body: { login: 'qa-b-' + suffix, password },
    expected: 201,
  });
  tokenB = (await request('admin/login', { method: 'POST', body: { login: 'qa-b-' + suffix, password } }))
    .token;
  const teacherContext = await browser.newContext({ viewport: { width: 390, height: 850 } });
  contexts.push(teacherContext);
  const teacher = await teacherContext.newPage();
  teacher.on('pageerror', (error) => errors.push(error.message));
  await teacher.goto(base + '/oqituvchi/kirish.html');
  await teacher.locator('#admin-login').fill('qa-a-' + suffix);
  await teacher.locator('#pw').fill(password);
  await teacher.locator('#enter').click();
  await teacher.waitForURL('**/oqituvchi/index.html');
  await expect(teacher.locator('.admin-header .badge')).toContainText(schoolA.id);
  tokenA = await teacher.evaluate(() => sessionStorage.getItem('nazorat-token'));
  const cls = await request('admin/classes', {
    token: tokenA,
    method: 'POST',
    body: { name: 'QA-7' },
    expected: 201,
  });
  await teacher.goto(base + '/oqituvchi/sinflar.html');
  await expect(teacher.locator('#content')).toContainText('QA-7');
  assert(!(await request('admin/classes', { token: tokenB })).some((row) => row.id === cls.id));
  pass('Maktab admini o‘z sinfini UI’da ko‘rdi; B admin API’sida A sinfi yo‘q.');
  await teacher.goto(base + '/oqituvchi/sozlamalar.html');
  await teacher.locator('#password-form').waitFor();
  await expect(teacher.locator('#restore-file')).toHaveCount(0);
  await expect(teacher.locator('[data-action=clear]')).toHaveCount(0);
  pass('Maktab adminiga berilmagan restore/clear amallari UI’da ham yo‘q.');
  await request('super-admin/schools', { token: tokenA, expected: 403 });
  await request('admin/results', { token: root, expected: 403 });
  await request('admin/classes/' + cls.id, { token: tokenB, method: 'DELETE', expected: 404 });
  pass('Server rolni oshirish va begona ID bilan o‘chirishni rad etdi.');
  await teacher.goto(base + '/bosh-admin/index.html');
  await teacher.waitForURL('**/oqituvchi/index.html');
  await teacher.locator('#logout').click();
  await teacher.waitForURL('**/oqituvchi/kirish.html');
  await request('admin/session', { token: tokenA, expected: 401 });
  tokenA = null;
  pass('Begona paneldan yo‘naltirish va server logout ishladi.');
  assert.deepEqual(errors, []);
  pass('Yangi ekranlarda JavaScript xatosi kuzatilmadi.');
  artifact('roles-browser.json', { passed: logs.length, logs });
} finally {
  for (const token of [root, tokenA, tokenB].filter(Boolean))
    await request('admin/logout', { token, method: 'POST' }).catch(() => {});
  for (const context of contexts) await context.close();
  await browser.close();
}
