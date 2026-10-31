// Audit: 320 px, shaxsiy kod, XSS, editor xatosi, ikki oyna va oflayn tiklash.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { admin, request, fixture, cleanup, base, artifact } from './helpers.mjs';
const token = await admin(),
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
const f = await fixture(token, { timeLimitMin: 3 }, 'Aliyev Ali\nValiyeva Malika');
const logs = [],
  errors = [],
  screens = [],
  extraTests = [],
  extraClasses = [];
mkdirSync('artifacts', { recursive: true });
const pass = (message) => {
  logs.push(message);
  console.log('PASS:', message);
};
let teacher, student;
async function fit(page, label) {
  const style = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.className = 'hidden';
    document.body.append(probe);
    const hidden = getComputedStyle(probe).display;
    probe.remove();
    return {
      font: getComputedStyle(document.body).fontFamily,
      hidden,
      opacity: getComputedStyle(document.querySelector('button:not(:disabled)')).opacity,
    };
  });
  assert(style.font.includes('system-ui'), label + ' tizim shrifti');
  assert.equal(style.hidden, 'none');
  assert.equal(style.opacity, '1');
  const view = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter(
        (e) => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'absolute'
      )
      .slice(0, 10)
      .map((e) => e.tagName + '.' + e.className),
  }));
  if (view.overflow) artifact('audit-overflow.json', { label, ...view });
  assert.equal(view.overflow, false, label + ' ' + view.offenders.join(', '));
  await page.screenshot({ path: 'artifacts/audit-' + label + '.png', fullPage: true });
  screens.push(label);
}
try {
  const full = await request('admin/tests/' + f.test.id, { token });
  full.title = 'Nazorat'.repeat(14).slice(0, 98);
  full.questions[0].q = '<img src=x onerror="window.__xss=true"> & bilim?';
  full.questions[0].options[0] = '<svg onload="window.__xss=true">';
  await request('admin/tests/' + f.test.id, { token, method: 'PUT', body: full });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  teacher = await context.newPage();
  teacher.on('pageerror', (e) => errors.push(e.message));
  await teacher.goto(base + '/oqituvchi/kirish.html');
  await teacher.locator('#pw').fill(process.env.TEACHER_PASSWORD);
  await teacher.locator('#enter').click();
  await teacher.locator('#content h1').waitFor();
  for (const width of [320, 390, 1280])
    for (const colorScheme of ['light', 'dark']) {
      await teacher.setViewportSize({ width, height: 850 });
      await teacher.emulateMedia({ colorScheme });
      await fit(teacher, `teacher-${width}-${colorScheme}`);
    }
  await teacher.setViewportSize({ width: 1280, height: 900 });
  await teacher.goto(base + '/oqituvchi/sinflar.html');
  await teacher.locator(`[data-action=student-codes][data-id="${f.cls.id}"]`).click();
  await expect(teacher.locator('dialog')).toContainText(f.cls.students[0].accessCode);
  await teacher.locator('[data-cancel]').click();
  pass('S02: o’qituvchi shaxsiy kodlarni yopiq panelda ko’ra oldi.');

  await teacher.goto(base + '/oqituvchi/test-tahrir.html');
  await teacher.locator('#edit-title').fill('Audit-saqlash-' + Date.now());
  const title = await teacher.locator('#edit-title').inputValue();
  await teacher.locator(`[name=classIds][value="${f.cls.id}"]`).check();
  await teacher.locator('#import-file').setInputFiles('samples/namuna-test.txt');
  await teacher.waitForFunction(() => document.getElementById('import-text').value.includes('ANSWER:'));
  await teacher.locator('#preview').click();
  await teacher.locator('[data-question="19"]').waitFor();
  let failOnce = true;
  await teacher.route('**/api/admin/tests', async (route) => {
    if (route.request().method() === 'POST' && failOnce) {
      failOnce = false;
      await route.fetch();
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Audit: javob uzildi' }),
      });
    } else await route.continue();
  });
  await teacher.locator('[data-confirm]').click();
  await expect(teacher.locator('dialog')).toContainText('Audit: javob uzildi');
  await expect(teacher.locator('#edit-title')).toHaveValue(title);
  await expect(teacher.locator('[data-question]')).toHaveCount(20);
  await teacher.locator('[data-confirm]').click();
  await teacher.waitForURL('**/oqituvchi/testlar.html');
  const created = (await request('admin/tests', { token })).filter((t) => t.title === title);
  assert.equal(created.length, 1);
  extraTests.push(created[0]);
  pass('T01/U01: server saqlagan javob uzilganda forma yo’qolmadi; retry bitta test qoldirdi.');

  await teacher.goto(base + '/oqituvchi/sinflar.html');
  await teacher.locator('[data-action=new-class]').click();
  await teacher.locator('#class-name').fill(f.cls.name);
  await teacher.locator('[data-confirm]').click();
  await expect(teacher.locator('dialog')).toContainText('Bu sinf nomi mavjud');
  await expect(teacher.locator('#class-name')).toHaveValue(f.cls.name);
  await teacher.locator('[data-cancel]').click();
  pass('T01: sinf saqlash xatosida modal va yozilgan nom saqlandi.');

  const seen = [];
  teacher.on('request', (r) => seen.push(r.url()));
  await teacher.goto(base + '/oqituvchi/sozlamalar.html');
  await teacher.locator('#password-form').waitFor();
  assert(!seen.some((url) => url.includes('/api/admin/results')));
  pass('U01: Sozlamalar natijalar tarixini yuklamadi.');

  const pupil = await browser.newContext({ viewport: { width: 320, height: 850 } });
  await pupil.addInitScript(() => {
    const real = Date.now;
    Date.now = () => real() + 600000;
    window.__xss = false;
  });
  student = await pupil.newPage();
  student.on('pageerror', (e) => errors.push(e.message));
  const cdp = await pupil.newCDPSession(student);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 200,
    downloadThroughput: 128 * 1024,
    uploadThroughput: 64 * 1024,
  });
  await student.goto(base);
  await student.locator(`#grade option[value="${f.cls.id}"]`).waitFor({ state: 'attached' });
  await fit(student, 'home-320-slow');
  await student.locator('#grade').selectOption(f.cls.id);
  await student.locator(`#tsel option[value="${f.test.id}"]`).waitFor({ state: 'attached' });
  await student.locator('#tsel').selectOption(f.test.id);
  await student.locator('#student-code').fill('WRONG');
  await student.locator('#go').click();
  await expect(student.locator('#serr')).toContainText('kodi noto’g’ri');
  await student.locator('#student-code').fill(f.cls.students[0].accessCode);
  await student.locator('#go').click();
  await student.locator('#test').waitFor({ state: 'visible' });
  await expect(student.locator('#timer')).toHaveText(/^[23]:\d\d$/);
  await fit(student, 'question-320-long-text');
  assert.equal(await student.evaluate(() => window.__xss), false);
  assert.equal(await student.locator('#options svg').count(), 0);
  await student.locator('input[name=answer][value="1"]').check();
  assert.equal(await student.evaluate(() => document.activeElement.value), '1');
  assert.equal(
    await student.evaluate(() => getComputedStyle(document.activeElement.closest('.option')).outlineWidth),
    '3px'
  );
  await expect(student.locator('#save-status')).toContainText('serverda saqlandi', { timeout: 15000 });
  pass(
    'S02/R02/L02: sekin internet, noto’g’ri kod, 10 daqiqa xato soat va radio fokus tekshirildi; XSS bajarilmadi.'
  );

  const duplicate = await pupil.newPage();
  await duplicate.goto(base + '/test.html');
  await expect(duplicate.locator('#ttl')).toHaveText('Test boshqa oynada ochiq');
  await duplicate.close();
  const home = await pupil.newPage();
  await home.goto(base);
  await home.locator(`#grade option[value="${f.cls.id}"]`).waitFor({ state: 'attached' });
  await home.locator('#grade').selectOption(f.cls.id);
  await home.locator(`#tsel option[value="${f.test.id}"]`).waitFor({ state: 'attached' });
  await home.locator('#tsel').selectOption(f.test.id);
  await home.locator('#student-code').fill(f.cls.students[1].accessCode);
  await home.locator('#go').click();
  await expect(home.locator('#serr')).toContainText('boshqa oynada ochiq');
  await home.close();
  pass('R03: ikkinchi oyna tahrirlashga kirmadi va boshqa test draft ustiga yozilmadi.');

  await pupil.setOffline(true);
  await student.locator('#next').click();
  await student.locator('input[name=answer][value="0"]').check();
  await pupil.setOffline(false);
  await expect(student.locator('#save-status')).toContainText('serverda saqlandi', { timeout: 15000 });
  await student.reload();
  await student.locator('#test').waitFor({ state: 'visible' });
  await expect(student.locator('input[name=answer][value="0"]')).toBeChecked();
  await student.locator('#send').click();
  await student.locator('[data-confirm]').click();
  await student.locator('#done').waitFor({ state: 'visible' });
  await expect(student.locator('#score')).toContainText('/ 20');
  pass('R01: offline javob serverga tiklandi, reload va yakuniy yuborish ishladi.');
  await teacher.goto(base + '/oqituvchi/natijalar.html');
  await teacher.locator('#result-search').fill('Ali');
  await teacher.locator('#result-search').focus();
  await teacher.evaluate(() => document.dispatchEvent(new Event('teacher:data')));
  await expect(teacher.locator('#result-search')).toBeFocused();
  await expect(teacher.locator('#result-search')).toHaveValue('Ali');
  assert.deepEqual(errors, []);
  pass('T02: natijalar yangilanganda qidiruv va fokus saqlandi; 0 JS xato.');
  artifact('audit-browser.json', { passed: logs.length, logs, screens, errors });
  await context.close();
  await pupil.close();
} catch (error) {
  if (student)
    await student.screenshot({ path: 'artifacts/audit-browser-failure.png', fullPage: true }).catch(() => {});
  else if (teacher)
    await teacher.screenshot({ path: 'artifacts/audit-browser-failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally {
  for (const t of extraTests) await request('admin/tests/' + t.id, { token, method: 'DELETE' });
  for (const c of extraClasses) await request('admin/classes/' + c.id, { token, method: 'DELETE' });
  await cleanup(token, f.cls, f.test);
  await browser.close();
}
