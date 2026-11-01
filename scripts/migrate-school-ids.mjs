// Lokal maktab ID migratsiyasi: standart dry-run, yozish faqat --apply bilan.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const base = process.env.TEST_BASE_URL || 'http://localhost:8888';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname))
  throw new Error('Migratsiya skripti faqat localhost uchun.');
async function request(path, body, token) {
  const response = await fetch(base + '/api/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Migratsiya so'rovi bajarilmadi.");
  return data;
}
const credentials = JSON.parse(readFileSync('.local/roles-dev.json', 'utf8').replace(/^\uFEFF/, ''));
const { token } = await request('admin/login', credentials);
try {
  const report = await request(
    'super-admin/schools/migrate-public-ids',
    { apply: process.argv.includes('--apply') },
    token
  );
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/school-id-migration.json', JSON.stringify(report, null, 2));
  console.log(
    `${report.applied ? 'APPLIED' : 'DRY-RUN'}: ${report.total} maktab, ${report.changes.length} yangi ID.`
  );
} finally {
  await request('admin/logout', {}, token);
}
