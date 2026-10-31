import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const base = 'http://localhost:8888';
const text = await readFile('namuna-test.txt', 'utf8');
const source = await readFile('netlify/functions/api.mjs', 'utf8');
const parse = vm.runInNewContext(source.slice(source.indexOf('function parseAiken'), source.indexOf('export default')) + '\nparseAiken');
assert.equal(parse(text).length, 20);
assert.equal(parse('\ufeff' + text.replace(/\r?\n/g, '\r\n')).length, 20);
for (const invalid of ['', 'Savol\nA. Bir\nB. Ikki', 'Savol\nA. Bir\nB. Ikki\nANSWER: C', 'Savol\nA. Bir\nB. Ikki\nANSWER: A\nANSWER: B', 'Savol\nANSWER: A\nA. Bir\nB. Ikki']) {
  assert.throws(() => parse(invalid));
}
console.log('PASS: parser: 20 questions, UTF-8 BOM/CRLF, invalid inputs');
for (const path of ['index.html', 'teacher.html']) {
  const html = await readFile(path, 'utf8');
  new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
}
if (process.argv.includes('--parser-only')) process.exit(0);
const { chromium } = await import('@playwright/test');
const browser = await chromium.launch({ headless: true });
let id;
const password = process.env.TEACHER_PASSWORD || 'oqituvchi123';
const errors = [];
try {
  const teacher = await browser.newPage();
  teacher.on('pageerror', e => errors.push(e.message));
  await teacher.goto(base + '/teacher.html');
  await teacher.locator('#pw').fill(password);
  await teacher.locator('#enter').click();
  await teacher.locator('#panel').waitFor({ state: 'visible' });
  const title = 'Tekshiruv-' + Date.now();
  await teacher.locator('#title').fill(title);
  await teacher.locator('#grades').fill('7-A, 7-B');
  await teacher.locator('#file').setInputFiles('namuna-test.txt');
  await teacher.waitForFunction(() => document.getElementById('text').value.includes('ANSWER:'));
  await teacher.locator('#up').click();
  await teacher.locator('#uok').filter({ hasText: '20 ta savol' }).waitFor();
  const row = teacher.locator('#tt tr').filter({ hasText: title });
  await row.waitFor();
  id = await row.locator('[data-a="tg"]').getAttribute('data-id');
  console.log('PASS: teacher login, file upload, 20 questions saved');
  const student = await browser.newPage();
  student.on('pageerror', e => errors.push(e.message));
  await student.goto(base);
  await student.locator('#grade option').filter({ hasText: '7-A' }).waitFor({ state: 'attached' });
  await student.locator('#grade').selectOption({ label: '7-A' });
  await student.locator(`#tsel option[value="${id}"]`).waitFor({ state: 'attached' });
  await student.locator('#tsel').selectOption(id);
  await student.locator('#name').fill('Sinov');
  await student.locator('#surname').fill('Oquvchi');
  await student.locator('#go').click();
  await student.locator('#test').waitFor({ state: 'visible' });
  const questions = parse(text);
  for (let i = 0; i < questions.length; i++) await student.locator(`input[name="q${i}"][value="${questions[i].answer}"]`).check();
  await student.locator('#send').click();
  await student.locator('#done').waitFor({ state: 'visible' });
  assert.equal(await student.locator('#score').textContent(), '20 / 20');
  console.log('PASS: class selection, 20 answers, submission: 20/20');
  await teacher.locator('#t2').click();
  await teacher.locator('#tb tr').filter({ hasText: title }).waitFor();
  assert.match(await teacher.locator('#tb tr').filter({ hasText: title }).textContent(), /20\/20.*100%/);
  assert.deepEqual(errors, []);
  console.log('PASS: teacher results show student, class, 20/20 and 100%; no browser errors');
} finally {
  if (id) await fetch(base + '/api/admin/tests/' + id, { method: 'DELETE', headers: { 'x-password': password } });
  await browser.close();
}
