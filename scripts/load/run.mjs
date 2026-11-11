// k6 ni alohida sinov manzilida ishga tushirib, xom o'lchov va hisobotni saqlaydi.
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, open } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { loadTarget } from './target.mjs';
import { analyze } from './analyze.mjs';
const fixturePath = resolve(process.env.LOAD_FIXTURE || '.local/load/fixture.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const target = loadTarget(fixture.baseUrl);
if (target.environment !== fixture.environment) throw Error('Muhit mos emas.');
const run = process.env.RUN_ID || 'run-' + Date.now().toString(36);
if (run.length > 30 || !/^[a-z0-9-]+$/i.test(run)) throw Error('RUN_ID harf/raqam/defis bolsin.');
const prefix = resolve(process.env.LOAD_OUTPUT_PREFIX || '.local/load/' + run);
if (
  !prefix.startsWith(resolve('.local/load') + String.fromCharCode(92)) &&
  !prefix.startsWith(resolve('.local/load') + '/')
)
  throw Error('Output faqat .local/load ichida bolsin.');
await mkdir(dirname(prefix), { recursive: true });
const out = await open(prefix + '.console.log', 'w');
const started = new Date().toISOString();
const child = spawn(
  process.env.K6_BIN || 'k6',
  ['run', '--quiet', '--out', 'json=' + prefix + '.events.json', 'scripts/load/students.js'],
  {
    env: {
      ...process.env,
      FIXTURE: fixturePath,
      LOAD_BASE_URL: target.baseUrl,
      CONFIRM_LOAD_TARGET: target.baseUrl,
      RUN_ID: run,
      SUMMARY_PATH: prefix + '.summary.json',
    },
    stdio: ['ignore', out.fd, out.fd],
  }
);
console.log(
  JSON.stringify({
    run,
    pid: child.pid,
    environment: target.environment,
    requested: Number(process.env.STUDENTS || 50),
    holdSeconds: Number(process.env.HOLD_SECONDS || 30),
    output: prefix,
  })
);
const code = await new Promise((done, reject) => {
  child.on('error', reject);
  child.on('exit', done);
});
await out.close();
const result = await analyze(prefix);
await writeFile(
  prefix + '.run.json',
  JSON.stringify({ started, finished: new Date().toISOString(), exitCode: code, ...result }, null, 2)
);
console.log(JSON.stringify(result, null, 2));
process.exitCode = code || (result.phasePassed ? 0 : 99);
