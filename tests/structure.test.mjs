// Tuzilma tekshiruvining o’zi xato holatlarni rad etishini tekshiradi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CHECKER = fileURLToPath(new URL('../scripts/check-structure.mjs', import.meta.url));
function fixture(run) {
  const prefix = join(tmpdir(), 'nazorat-structure-');
  const root = mkdtempSync(prefix);
  const write = (path, text) => {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, text);
  };
  const check = () => spawnSync(process.execPath, [CHECKER, root], { encoding: 'utf8' });
  try {
    run({ write, check });
  } finally {
    if (resolve(root).startsWith(resolve(prefix))) rmSync(root, { recursive: true, force: true });
  }
}
test('Tuzilma: modulga ulangan toza HTML o’tadi', () =>
  fixture(({ write, check }) => {
    write(
      'public/index.html',
      '<!doctype html><!-- Home --><script type="module" src="/js/home.js"></script>'
    );
    write('public/js/home.js', '// Home entry.\nexport const VALUE=1;');
    assert.equal(check().status, 0);
  }));
test('Tuzilma: 250 qator, inline kod va tashqi papka havolasi rad etiladi', () =>
  fixture(({ write, check }) => {
    write(
      'public/index.html',
      '<script>bad()</script><style>body{}</style><a onclick="bad()" href="../private.txt">x</a>\n' +
        'x\n'.repeat(251)
    );
    const report = check();
    assert.notEqual(report.status, 0);
    for (const expected of [
      'chegara 250',
      'inline script',
      'inline style',
      'inline hodisa',
      'public/ tashqarisiga',
    ])
      assert(report.stderr.includes(expected));
  }));
test('Tuzilma: Blobs route ichida va service pastki adapteri rad etiladi', () =>
  fixture(({ write, check }) => {
    write('server/routes/public/example.mjs', "// Route.\nimport {getStore} from '@netlify/blobs';");
    write(
      'server/services/example-service.mjs',
      "// Service.\nimport {get} from '../repositories/blob-store.mjs';"
    );
    const report = check();
    assert.notEqual(report.status, 0);
    assert(report.stderr.includes('Blobs importi'));
    assert(report.stderr.includes('pastki Blobs'));
  }));
test('Tuzilma: API 20 qator chegarasi tekshiriladi', () =>
  fixture(({ write, check }) => {
    write('netlify/functions/api.mjs', '// Entry.\n' + '// line\n'.repeat(20));
    const report = check();
    assert.notEqual(report.status, 0);
    assert(report.stderr.includes('20 qatordan oshmasin'));
  }));
