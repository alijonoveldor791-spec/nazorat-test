// Zaxira tekshiruvi to\'liq tugagandan keyingina yozuvlarni tiklaydi.
import * as testsRepo from '../repositories/tests-repo.mjs';
import * as classesRepo from '../repositories/classes-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import * as startsRepo from '../repositories/attempt-starts-repo.mjs';
import { listClasses } from './class-service.mjs';

import { fail } from '../lib/http.mjs';
import { classValid } from '../lib/validate.mjs';
import { validId, restoreTest, restoreResult } from '../lib/backup-validate.mjs';

export async function backupData() {
  const tests = await testsRepo.list(true),
    results = await resultsRepo.list(true);
  const rich = [...tests, ...results].some((row) => row.questions?.some((q) => q.rich));
  return {
    version: rich ? 3 : 2,
    ...(rich ? { assetStorage: 'inline-raster-v1', sourceFilesIncluded: false } : {}),
    created: new Date().toISOString(),
    classes: await listClasses(true),
    tests,
    results,
  };
}
export async function restoreData(backup) {
  if (
    ![2, 3].includes(backup.version) ||
    !Array.isArray(backup.classes) ||
    !Array.isArray(backup.tests) ||
    !Array.isArray(backup.results)
  )
    fail('Zaxira formati yaroqsiz.');
  if (
    backup.version === 3 &&
    (backup.assetStorage !== 'inline-raster-v1' || backup.sourceFilesIncluded !== false)
  )
    fail("Boy kontent zaxira manifesti noto'g'ri.");
  if (
    backup.version === 2 &&
    [...backup.tests, ...backup.results].some((row) => row?.questions?.some((q) => q?.rich))
  )
    fail('Boy kontent uchun 3-versiyali zaxira kerak.');
  if (backup.classes.length > 200 || backup.tests.length > 1000 || backup.results.length > 20000)
    fail("Zaxirada yozuvlar juda ko'p.");
  const classes = backup.classes.map((c) => ({ ...classValid(c), id: validId(c.id) }));
  if (new Set(classes.map((c) => c.id)).size !== classes.length) fail('Zaxirada sinf ID takrorlangan.');
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const tests = backup.tests.map((raw) => restoreTest(raw, classMap));
  const results = backup.results.map(restoreResult);
  if (
    new Set(tests.map((t) => t.id)).size !== tests.length ||
    new Set(results.map((r) => r.id)).size !== results.length
  )
    fail('Zaxirada ID takrorlangan.');
  for (const row of classes) await classesRepo.save(row);
  for (const row of tests) await testsRepo.save(row);
  for (const row of results) await resultsRepo.save(row);
  return { ok: true, counts: { classes: classes.length, tests: tests.length, results: results.length } };
}
export async function clearData(payload) {
  if (payload.confirmation !== 'HAMMASINI OCHIRISH') fail('Tozalash tasdiqlanmadi.');
  for (const repo of [testsRepo, resultsRepo, classesRepo, attemptsRepo, retakesRepo, startsRepo])
    await repo.clear();
  return { ok: true };
}
