// Jonli deployni faqat GET orqali tekshiradi; login yoki ma’lumot yozish yo’q.
import { readFileSync } from 'node:fs';
const base = new URL(process.argv[2] || 'https://nazorat-test.netlify.app');
const checks = [
  { path: '/', status: 200, type: 'text/html' },
  { path: '/oqituvchi/kirish.html', status: 200, type: 'text/html', contains: 'data-password-toggle' },
  {
    path: '/js/components/password-field.js',
    status: 200,
    type: 'javascript',
    file: '../public/js/components/password-field.js',
  },
  { path: '/api/classes', status: 200, type: 'application/json', array: true },
  { path: '/api/admin/session', status: 401, type: 'application/json' },
  { path: '/.env', status: 404 },
];
let failed = 0;
const normalize = (text) => text.replace(/\r\n/g, '\n').trim();
for (const check of checks) {
  try {
    const response = await fetch(new URL(check.path, base), { signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    if (response.status === 401 && /<title>Login Redirect<\/title>/i.test(body))
      throw new Error('Netlify kirish cheklovi: Visitor access / Project visibility sozlamasini tekshiring.');
    if (response.status !== check.status)
      throw new Error(`HTTP ${response.status}; kutilgan ${check.status}`);
    if (check.type && !response.headers.get('content-type')?.includes(check.type))
      throw new Error(`Javob turi ${check.type} emas; Functions va /api redirectini tekshiring.`);
    if (check.contains && !body.includes(check.contains))
      throw new Error('Sahifa eski yoki kutilgan element yo’q.');
    if (
      check.file &&
      normalize(body) !== normalize(readFileSync(new URL(check.file, import.meta.url), 'utf8'))
    )
      throw new Error('Jonli parol komponenti lokal nusxadan farq qiladi.');
    if (check.array && !Array.isArray(JSON.parse(body))) throw new Error('Public API ro’yxat qaytarmadi.');
    if (check.status === 200 && check.type === 'text/html') {
      if (!response.headers.get('content-security-policy')) throw new Error('CSP headeri yo’q.');
      if (response.headers.get('x-content-type-options') !== 'nosniff')
        throw new Error('nosniff headeri yo’q.');
    }
    console.log(`PASS: ${check.path} HTTP ${response.status}`);
  } catch (error) {
    failed++;
    console.error(`FAIL: ${check.path}: ${error.message}`);
  }
}
console.log(`${checks.length - failed}/${checks.length} deploy tekshiruvi o’tdi.`);
if (failed) process.exitCode = 1;
