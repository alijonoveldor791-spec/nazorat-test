// First-party JS/MJS sintaksisini yozuvsiz tekshiradi; ESLint keyingi bosqichda ulanadi.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SOURCE_DIRECTORIES = ['public/js', 'server', 'netlify/functions', 'scripts', 'tests'];
const IGNORED_DIRECTORIES = new Set(['node_modules', 'vendor', '.git', '.local', '.netlify', 'artifacts']);
const ROOT = fileURLToPath(new URL('../', import.meta.url));

export function sourceFiles(root = ROOT) {
  const walk = (directory) => {
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if (IGNORED_DIRECTORIES.has(entry.name)) return [];
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return walk(path);
      return entry.isFile() && ['.js', '.mjs'].includes(extname(entry.name)) ? [path] : [];
    });
  };
  return SOURCE_DIRECTORIES.flatMap((directory) => walk(resolve(root, directory))).sort();
}

export function inspectSource(source) {
  const result = spawnSync(process.execPath, ['--check', '--input-type=module'], {
    input: source,
    encoding: 'utf8',
    timeout: 10000,
  });
  return { ok: !result.error && result.status === 0, error: result.error?.message || result.stderr };
}

export function checkSyntax(root = ROOT) {
  const files = sourceFiles(root);
  const failures = files.flatMap((path) => {
    const result = inspectSource(readFileSync(path, 'utf8'));
    return result.ok ? [] : [{ path, error: result.error }];
  });
  return { checked: files.length, failures };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { checked, failures } = checkSyntax();
  for (const failure of failures) console.error(`${failure.path}\n${failure.error}`);
  console.log(`${failures.length ? 'FAIL' : 'PASS'}: ${checked} JS/MJS; ${failures.length} syntax xatosi.`);
  process.exitCode = failures.length ? 1 : 0;
}
