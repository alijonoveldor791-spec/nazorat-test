// Tuzilma, fayl chegaralari va brauzer havolalarini tekshiradi.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname, extname, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_ROOT = resolve(ROOT, 'public');
const IGNORED = new Set([
  'node_modules',
  '.git',
  '.netlify',
  '.local',
  'artifacts',
  'test-results',
  'playwright-report',
]);
const TEXT_EXTENSIONS = new Set(['.js', '.mjs', '.html', '.css', '.json', '.md', '.toml', '.txt', '.svg']);
const CODE_EXTENSIONS = new Set(['.js', '.mjs', '.html', '.css']);
const errors = [],
  measured = [];

function files(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (IGNORED.has(entry.name) || entry.name.startsWith('.env')) return [];
    const full = resolve(folder, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}
const display = (path) => relative(ROOT, path).replaceAll('\\', '/');
const report = (path, message) => errors.push(`${display(path)}: ${message}`);

function checkReference(file, reference) {
  if (
    !reference ||
    /^(?:#|data:|blob:|mailto:|tel:|https?:|\/\/)/i.test(reference) ||
    reference.includes('${')
  )
    return;
  let path;
  try {
    path = decodeURIComponent(reference.split(/[?#]/)[0]);
  } catch {
    report(file, `havola noto\'g\'ri: ${reference}`);
    return;
  }
  if (!path) return;
  const target = path.startsWith('/') ? resolve(PUBLIC_ROOT, '.' + path) : resolve(dirname(file), path);
  if (target !== PUBLIC_ROOT && !target.startsWith(PUBLIC_ROOT + sep)) {
    report(file, `public/ tashqarisiga havola: ${reference}`);
    return;
  }
  if (!existsSync(target)) report(file, `havola topilmadi: ${reference}`);
  else if (statSync(target).isDirectory() && !existsSync(resolve(target, 'index.html')))
    report(file, `papkada index.html yo\'q: ${reference}`);
}

for (const file of files(ROOT)) {
  const extension = extname(file),
    name = display(file);
  if (!TEXT_EXTENSIONS.has(extension)) continue;
  const source = readFileSync(file, 'utf8');
  const lines = source.trimEnd().split(/\r?\n/).length;
  measured.push({ file: name, lines });
  if (lines > 250) report(file, `${lines} qator (chegara 250)`);
  if (
    CODE_EXTENSIONS.has(extension) &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.test)?\.(?:js|mjs|html|css)$/.test(basename(file))
  )
    report(file, 'fayl nomi kichik harf va defis bilan yozilsin');
  if (['.js', '.mjs', '.css'].includes(extension) && !/^\s*(?:\/\/|\/\*)/.test(source))
    report(file, "boshida qisqa izoh yo'q");
  if (extension === '.html') {
    if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>/i.test(source)) report(file, 'src siz inline script');
    if (/<style\b/i.test(source)) report(file, 'inline style bloki');
    if (/\s(?:on\w+|style)\s*=/i.test(source)) report(file, 'inline hodisa yoki style atributi');
    for (const match of source.matchAll(/<script\b([^>]*)>/gi))
      if (!/type\s*=\s*["']module["']/i.test(match[1])) report(file, 'script type="module" bo\'lsin');
  }
  if (
    name.startsWith('server/') &&
    /(?:from\s*|import\s*)['"]@netlify\/blobs['"]/.test(source) &&
    !name.startsWith('server/repositories/')
  )
    report(file, "Blobs importi faqat repositories/ da bo'lsin");
  if (name.startsWith('server/routes/') && /from\s*['"][^'"]*repositories\//.test(source))
    report(file, 'route repositoryni bevosita chaqirmasin');
  if (name.startsWith('server/services/') && /from\s*['"][^'"]*blob-store\.mjs/.test(source))
    report(file, 'service pastki Blobs adapterini bevosita chaqirmasin');
  if (name === 'netlify/functions/api.mjs' && lines > 20)
    report(file, 'API kirish nuqtasi 20 qatordan oshmasin');
  if (!name.startsWith('public/')) continue;
  if (extension === '.html' || extension === '.js') {
    for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g))
      checkReference(file, match[1]);
    for (const match of source.matchAll(/location\.(?:assign|replace)\(\s*['"]([^'"]+)['"]/g))
      checkReference(file, match[1]);
  }
  if (extension === '.js') {
    for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g)) {
      if (!/^[./]/.test(match[1])) report(file, `brauzerda paket importi: ${match[1]}`);
      else checkReference(file, match[1]);
    }
    if (source.includes('aiken-parser')) report(file, 'Aiken parser brauzerga import qilinmasin');
  }
  if (extension === '.css')
    for (const match of source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))
      checkReference(file, match[1]);
}

measured.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`FAIL: ${errors.length} ta tuzilma xatosi.`);
  process.exitCode = 1;
} else {
  console.log(
    `PASS: ${measured.length} fayl; 250 qator, inline kod, qatlamlar va public havolalari tekshirildi.`
  );
  console.table(measured.slice(0, 10));
}
