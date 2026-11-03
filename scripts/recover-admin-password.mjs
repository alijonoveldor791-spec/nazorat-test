// Loyiha egasi uchun aniq Netlify site'dagi admin parolini interaktiv tiklaydi.
import { createInterface } from 'node:readline';
import { passwordHash } from '../server/lib/password.mjs';
import { requirePassword } from '../server/lib/password-policy.mjs';
import { inspectAdmin, recoverAdmin } from '../server/repositories/admin-recovery-repo.mjs';

const args = process.argv.slice(2);
const value = (key) => args[args.indexOf(key) + 1];
const siteId = value('--site-id'), login = value('--login')?.toLowerCase();
const token = process.env.NETLIFY_AUTH_TOKEN;
if (!siteId || !login || !token) throw new Error('NETLIFY_AUTH_TOKEN, --site-id va --login majburiy.');
if (!/^[\w-]{8,128}$/.test(siteId) || !/^[a-z0-9][a-z0-9._-]{2,59}$/.test(login))
  throw new Error('Site ID yoki login formati noto\'g\'ri.');
const account = await inspectAdmin(siteId, token, login);
if (!account || !['super_admin', 'school_admin'].includes(account.role)) throw new Error('Admin hisobi topilmadi.');
if (!args.includes('--apply')) {
  console.log(`DRY-RUN: ${account.role} hisobi ${login} topildi; ma'lumot o'zgarmadi.`);
  process.exit(0);
}
const terminal = createInterface({ input: process.stdin, output: process.stdout });
const confirm = await terminal.question(`Parolni ${login} uchun ${siteId} site'da almashtirish uchun site IDni kiriting: `);
terminal.close();
if (confirm !== siteId) throw new Error('Site ID mos kelmadi.');
const password = await hiddenInput('Yangi parol (6–128 belgi): ');
requirePassword(password, 'Yangi parol');
const result = await recoverAdmin(siteId, token, login, await passwordHash(password));
terminal.close();
console.log(`Tiklandi: ${result.login} (${result.role}); oldingi sessiyalar bekor qilindi.`);

async function hiddenInput(prompt) {
  if (!process.stdin.isTTY) throw new Error('Parol uchun interaktiv terminal kerak.');
  process.stdout.write(prompt);
  const input = process.stdin;
  input.setRawMode(true);
  input.resume();
  let value = '';
  return new Promise((resolve, reject) => {
    const cleanup = () => { input.setRawMode(false); input.pause(); input.removeListener('data', onData); process.stdout.write('\n'); };
    const onData = (chunk) => {
      for (const char of chunk.toString()) {
        if (char === '\u0003') { cleanup(); reject(new Error('Bekor qilindi.')); }
        else if (char === '\r' || char === '\n') { cleanup(); return resolve(value); }
        else if (char === '\u007f') value = value.slice(0, -1);
        else value += char;
      }
    };
    input.on('data', onData);
  });
}
