// Netlify CLI hisobi orqali bazaning tekshirilgan lokal nusxasi va maxfiy lokal sozlamalarni tayyorlaydi.
import { randomBytes } from 'node:crypto';
import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { copyNetlifySnapshot } from '../server/repositories/netlify-snapshot-repo.mjs';

const args = process.argv.slice(2);
const siteId = args[args.indexOf('--site-id') + 1];
if (!args.includes('--site-id') || !/^[a-f0-9-]{36}$/.test(siteId || '')) {
  throw new Error('--site-id bilan Netlify loyiha IDsi berilsin.');
}
if (process.env.NETLIFY === 'true' || process.env.NODE_ENV === 'production') {
  throw new Error('Nusxalash faqat lokal muhit uchun.');
}
try {
  await access('.env');
  throw new Error(".env mavjud; uni almashtirish o'rniga alohida lokal checkout ishlating.");
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

let token = process.env.NETLIFY_AUTH_TOKEN;
if (!token) {
  const configRoot = process.env.APPDATA
    ? join(process.env.APPDATA, 'netlify', 'Config')
    : join(process.env.XDG_CONFIG_HOME || join(process.env.HOME || '', '.config'), 'netlify');
  const config = JSON.parse(await readFile(join(configRoot, 'config.json'), 'utf8'));
  token = config.users?.[config.userId]?.auth?.token;
}
if (!token) throw new Error('Avval npx netlify-cli login orqali hisobga kiring.');

async function request(path) {
  const response = await fetch('https://api.netlify.com/api/v1' + path, {
    headers: { Authorization: 'Bearer ' + token },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Netlify API ruxsati yoki javobi tekshirilsin (${response.status}).`);
  return response.json();
}
const site = await request('/sites/' + siteId);
console.log(`Manba: ${site.ssl_url || site.url}`);
const account = encodeURIComponent(site.account_slug);
const query = '?scope=functions';
const [shared, specific] = await Promise.all([
  request(`/accounts/${account}/env${query}`),
  request(`/accounts/${account}/env${query}&site_id=${siteId}`),
]);
const sourceEnv = { ...(site.build_settings?.env || {}) };
for (const variable of [...shared, ...specific]) {
  const selected = variable.is_secret
    ? variable.values?.find((item) => item.context === 'dev')
    : variable.values?.find((item) => item.context === 'production') ||
      variable.values?.find((item) => item.context === 'all') ||
      variable.values?.find((item) => item.context === 'dev');
  if (selected && typeof selected.value === 'string') sourceEnv[variable.key] = selected.value;
}
for (const key of ['TOKEN_SECRET', 'TEST_CODE_ENCRYPTION_KEY', 'TEST_CODE_ENCRYPTION_KEY_PREVIOUS']) {
  if (process.env[key]) sourceEnv[key] = process.env[key];
}
if (!sourceEnv.TOKEN_SECRET || sourceEnv.TOKEN_SECRET.length < 32)
  sourceEnv.TOKEN_SECRET = randomBytes(48).toString('hex');
console.log('Maxfiy production kalitlari API orqali olinmaydi; mavjud dev/lokal kalitlar ishlatiladi.');
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const snapshot = resolve('.local', 'snapshots', stamp);
const database = join(snapshot, 'blobs');
await mkdir(snapshot, { recursive: true });
const manifest = await copyNetlifySnapshot({
  siteId,
  token,
  directory: database,
  onStore: ({ name, count }) => console.log(`${name}: ${count} yozuv`),
});
await writeFile(join(snapshot, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 });
const working = join('.local', 'databases', stamp);
await cp(database, working, { recursive: true, errorOnExist: true, force: false });
const localEnv = {
  NAZORAT_LOCAL_DATA: working.replaceAll('\\', '/'),
  TOKEN_SECRET: sourceEnv.TOKEN_SECRET,
  ADMIN_SESSION_SECRET: randomBytes(48).toString('hex'),
};
for (const key of ['TEST_CODE_ENCRYPTION_KEY', 'TEST_CODE_ENCRYPTION_KEY_PREVIOUS']) {
  if (sourceEnv[key]) localEnv[key] = sourceEnv[key];
}
const content =
  '# Faqat lokal nusxa; Gitga kiritilmasin.\n' +
  Object.entries(localEnv)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('\n') +
  '\n';
await writeFile('.env', content, { flag: 'wx', mode: 0o600 });
console.log(
  `PASS: ${manifest.stores.length} ombor, ${manifest.stores.reduce((sum, store) => sum + store.blobs.length, 0)} yozuv.`
);
console.log(`Zaxira: ${snapshot}\nIshchi nusxa: ${working}\nIshga tushirish: npm run dev`);
