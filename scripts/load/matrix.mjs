// Bir xil fixture bilan 50/200/500 va ikki test turining k6 matritsasini bajaradi.
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { loadTarget } from './target.mjs';
const fixture = JSON.parse(await readFile(process.env.LOAD_FIXTURE || '.local/load/fixture.json', 'utf8'));
loadTarget(fixture.baseUrl);
const prefix = process.env.MATRIX_PREFIX || 'matrix-' + Date.now().toString(36);
const stages = String(process.env.MATRIX_STUDENTS || '50,200,500')
  .split(',')
  .map(Number);
if (stages.some((n) => ![50, 200, 500].includes(n))) throw Error('MATRIX_STUDENTS faqat 50,200,500.');
let failed = false;
for (const count of stages)
  for (const kind of ['ordinary', 'block']) {
    const run = prefix + '-' + count + '-' + kind;
    const environment = {
      ...process.env,
      STUDENTS: String(count),
      TEST_KIND: kind,
      RUN_ID: run,
      HOLD_SECONDS: count === 500 ? '1200' : process.env.PROBE_HOLD_SECONDS || '60',
      START_WINDOW: '30',
      WARMUP_SECONDS: '30',
      SUBMIT_WINDOW: '25',
    };
    const child = spawn(process.execPath, ['scripts/load/run.mjs'], { env: environment, stdio: 'inherit' });
    const code = await new Promise((done, reject) => {
      child.on('exit', done);
      child.on('error', reject);
    });
    if (code !== 0) failed = true;
    const verify = spawn(process.execPath, ['scripts/load/verify.mjs'], {
      env: environment,
      stdio: 'inherit',
    });
    const verified = await new Promise((done, reject) => {
      verify.on('exit', done);
      verify.on('error', reject);
    });
    if (verified !== 0) failed = true;
  }
process.exitCode = failed ? 1 : 0;
