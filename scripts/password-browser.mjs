// Parolni ko’rsatish, klaviatura, mobil ekran va 6/12 belgili kirishni tekshiradi.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { admin, request, base, artifact } from './helpers.mjs';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname))
  throw new Error('Parol almashtirish sinovi faqat lokal muhit uchun.');
const original = process.env.TEACHER_PASSWORD;
await admin();
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 320, height: 850 } });
const logs = [],
  errors = [];
let activePassword = original;
page.on('pageerror', (error) => errors.push(error.message));
const pass = (message) => {
  logs.push(message);
  console.log('PASS:', message);
};
async function login(password) {
  await page.goto(base + '/oqituvchi/kirish.html');
  await page.locator('#pw').fill(password);
  await page.locator('#enter').click();
  await page.locator('#content h1').waitFor();
}
try {
  mkdirSync('artifacts', { recursive: true });
  await page.goto(base + '/oqituvchi/kirish.html');
  const input = page.locator('#pw'),
    toggle = page.locator('[data-password-toggle="pw"]');
  await input.fill(original);
  await expect(input).toHaveAttribute('type', 'password');
  await expect(input).toHaveAttribute('minlength', '6');
  await expect(input).toHaveAttribute('maxlength', '12');
  let loginRequests = 0;
  page.on('request', (req) => {
    if (req.url().endsWith('/api/admin/login')) loginRequests++;
  });
  await toggle.click();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toHaveValue(original);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveText('Berkitish');
  await toggle.press('Enter');
  await expect(input).toHaveAttribute('type', 'password');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(input).toHaveValue(original);
  assert.equal(loginRequests, 0);
  pass('Ko’rsatish/berkitish qiymatni saqlaydi, klaviaturada ishlaydi va formani yubormaydi.');
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/password-login-${width}.png`, fullPage: true });
  }
  pass('Kirish formasi 320, 390 va 1280 px ekranlarga sig’adi.');
  await page.locator('#enter').click();
  await page.locator('#content h1').waitFor();
  pass('Muhitdagi yangilangan parol bilan panelga kirildi.');
  for (const next of ['Ab_123', 'Ab_123456789']) {
    await page.goto(base + '/oqituvchi/sozlamalar.html');
    const old = page.locator('#old-password'),
      fresh = page.locator('#new-password');
    await old.fill(activePassword);
    await fresh.pressSequentially('12345');
    assert.equal(await fresh.evaluate((element) => element.validity.tooShort), true);
    await fresh.fill(next);
    await expect(fresh).toHaveAttribute('minlength', '6');
    await expect(fresh).toHaveAttribute('maxlength', '12');
    await page.locator('[data-password-toggle="new-password"]').click();
    await expect(fresh).toHaveAttribute('type', 'text');
    await expect(old).toHaveAttribute('type', 'password');
    await page.locator('[data-password-toggle="new-password"]').press('Space');
    await expect(fresh).toHaveAttribute('type', 'password');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const saved = page.waitForResponse(
      (response) => response.url().endsWith('/api/admin/password') && response.request().method() === 'POST'
    );
    await page.locator('#password-form button[type="submit"]').click();
    assert.equal((await saved).status(), 200);
    activePassword = next;
    await page.waitForURL('**/oqituvchi/kirish.html');
    await login(activePassword);
    pass(`${next.length} belgili parol forma orqali saqlandi va u bilan qayta kirildi.`);
  }
  assert.deepEqual(errors, []);
  artifact('password-browser.json', { passed: logs.length, logs, errors });
} finally {
  try {
    if (activePassword !== original) {
      const { token } = await request('admin/login', { method: 'POST', body: { password: activePassword } });
      await request('admin/password', {
        token,
        method: 'POST',
        body: { currentPassword: activePassword, newPassword: original },
      });
    }
    await admin();
  } finally {
    await browser.close();
  }
}
