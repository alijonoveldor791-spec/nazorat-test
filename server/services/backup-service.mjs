// Zaxira tekshiruvi to\'liq tugagandan keyingina yozuvlarni tiklaydi.
import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import * as testsRepo from '../repositories/tests-repo.mjs';
import * as classesRepo from '../repositories/classes-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import { listClasses } from './class-service.mjs';

import { fail } from '../lib/http.mjs';
import { classValid } from '../lib/validate.mjs';
import { validId, restoreTest, restoreResult } from '../lib/backup-validate.mjs';
import { currentAccess, runWithAccess } from '../lib/access-context.mjs';
import { env } from '../lib/env.mjs';
import * as archives from '../repositories/backup-archives-repo.mjs';
import * as audit from '../repositories/audit-repo.mjs';
import * as previews from '../repositories/backup-previews-repo.mjs';
import * as codesRepo from '../repositories/test-codes-repo.mjs';
import * as restoreLocks from '../repositories/restore-locks-repo.mjs';
import { codeKeyId, testCodeEncryptionKeyId } from '../lib/test-code.mjs';

async function record(action, auth, outcome, objectId = null, details = {}) {
  await audit.append(randomUUID(), {
    at: new Date().toISOString(), action, actorId: auth?.accountLogin || auth?.role || 'legacy_admin',
    schoolId: auth?.schoolId || null, objectId, outcome, ...details,
  });
}
function cleanCodeRegistry(value, schoolId) {
  if (!value || value.schoolId !== schoolId || value.schema !== 1 ||
    typeof value.keyId !== 'string' || !value.tests || !value.reserved ||
    Array.isArray(value.tests) || Array.isArray(value.reserved)) fail('Test-kod registri formati noto\'g\'ri.');
  if (Object.keys(value.tests).length > 1000 || Object.keys(value.reserved).length > 20000)
    fail('Test-kod registrida yozuvlar juda ko\'p.');
  const tests = Object.create(null), reserved = Object.create(null);
  for (const [id, raw] of Object.entries(value.tests)) {
    const testId = validId(id), encrypted = raw?.encrypted;
    if (!encrypted || !/^[a-f0-9]{64}$/.test(raw.digest) || !['active', 'inactive', 'revoked'].includes(raw.state) ||
      !Number.isInteger(raw.version) || raw.version < 1 || typeof encrypted.iv !== 'string' ||
      typeof encrypted.data !== 'string' || typeof encrypted.tag !== 'string' ||
      ![undefined, 1, 2].includes(encrypted.keyVersion) ||
      (encrypted.keyId !== undefined && !/^[a-f0-9]{24}$/.test(encrypted.keyId)) ||
      typeof raw.createdAt !== 'string' || !Number.isFinite(Date.parse(raw.createdAt)) ||
      ['activatedAt', 'revokedAt'].some((key) => raw[key] !== undefined &&
        (typeof raw[key] !== 'string' || !Number.isFinite(Date.parse(raw[key])))))
      fail('Test-kod registridagi yozuv yaroqsiz.');
    tests[testId] = { id: validId(raw.id), encrypted: Object.fromEntries(
      ['iv', 'data', 'tag', 'keyVersion', 'keyId'].filter((key) => encrypted[key] !== undefined).map((key) => [key, encrypted[key]])
    ), digest: raw.digest, state: raw.state, version: raw.version, createdAt: raw.createdAt,
      ...(raw.activatedAt ? { activatedAt: raw.activatedAt } : {}), ...(raw.revokedAt ? { revokedAt: raw.revokedAt } : {}) };
  }
  for (const [digestValue, id] of Object.entries(value.reserved)) {
    if (!/^[a-f0-9]{64}$/.test(digestValue)) fail('Test-kod rezervlari yaroqsiz.');
    reserved[digestValue] = validId(id);
  }
  for (const [id, row] of Object.entries(tests)) if (reserved[row.digest] !== id) fail('Test-kod rezervi bilan yozuvi mos emas.');
  return { schoolId, schema: 1, keyId: value.keyId, tests, reserved };
}

export async function backupData() {
  const auth = currentAccess();
  const backup = {
    format: 'nazorat-test-school-backup',
    version: 3,
    createdAt: new Date().toISOString(),
    sourceSchoolId: auth?.schoolId || null,
    includes: ['classes', 'tests', 'results', ...(auth?.schoolId ? ['encrypted-test-code-registry'] : [])],
    excludes: ['accounts', 'sessions', 'server-secrets', 'active-attempts'],
    classes: await listClasses(true),
    tests: await testsRepo.list(true),
    results: await resultsRepo.list(true),
  };
  if (auth?.schoolId) {
    backup.testCodeRegistry = await codesRepo.find(auth.schoolId);
    backup.testCodeEncryptionKeyIds = [...new Set(Object.values(backup.testCodeRegistry?.tests || {})
      .filter((row) => row.encrypted?.keyVersion === 2).map((row) => row.encrypted.keyId).filter(Boolean))];
  }
  await record('backup.export', auth, 'success', null, {
    counts: { classes: backup.classes.length, tests: backup.tests.length, results: backup.results.length },
  });
  return backup;
}
export async function restoreData(backup, dryRun = false, operationId = randomUUID()) {
  const auth = currentAccess();
  if (backup?.previewId) {
    const saved = await previews.find(backup.previewId);
    if (!saved || saved.schoolId !== (auth?.schoolId || null) || saved.fileHash !== backup.fileHash)
      fail('Preview topilmadi yoki zaxira fayli o\'zgargan.', 409);
    if (saved.state === 'complete') return saved.report;
    const current = await currentFingerprint();
    if (current !== saved.currentFingerprint) fail('Joriy ma\'lumotlar o\'zgargan. Yangi preview oling.', 409);
    const claimed = await previews.update(backup.previewId, (row) => {
      if (row.state === 'complete') return row;
      if (row.state === 'running' && row.lockedUntil > Date.now()) fail('Tiklash ayni paytda bajarilmoqda.', 409);
      return { ...row, state: 'running', lockedUntil: Date.now() + 300000 };
    });
    if (claimed.state === 'complete') return claimed.report;
    const operationId = saved.operationId || backup.previewId;
    const lockScope = auth?.schoolId || (auth?.role === 'legacy_admin' ? 'legacy' : null);
    if (lockScope) await restoreLocks.acquire(lockScope, operationId, backup.previewId);
    try {
      return await runWithAccess({ ...auth, restoreOperationId: operationId, restoreClaimId: backup.previewId }, async () => {
        if (await currentFingerprint() !== saved.currentFingerprint) {
          await previews.update(backup.previewId, (row) => ({ ...row, state: 'ready', lockedUntil: 0 }));
          fail('Joriy ma\'lumotlar o\'zgargan. Yangi preview oling.', 409);
        }
        try {
          const report = await restoreData(saved.data, false, operationId);
          await previews.update(backup.previewId, (row) => ({ ...row, state: report.report.errors.length ? 'partial' : 'complete', lockedUntil: 0, report }));
          return report;
        } catch (error) {
          await previews.update(backup.previewId, (row) => ({ ...row, state: 'partial', lockedUntil: 0 }));
          throw error;
        }
      });
    } finally {
      if (lockScope) await restoreLocks.release(lockScope, operationId, backup.previewId);
    }
  }
  if (auth?.role === 'school_admin' &&
    (backup.version !== 3 || backup.format !== 'nazorat-test-school-backup' || backup.sourceSchoolId !== auth.schoolId))
    fail("Faqat shu maktabning 3-format zaxirasini tiklash mumkin.", 403);
  if (auth?.role === 'legacy_admin' && backup.version === 3 && backup.sourceSchoolId !== null)
    fail('Maktab zaxirasini legacy admin orqali tiklash mumkin emas.', 403);
  const codeRegistry = backup.testCodeRegistry ? cleanCodeRegistry(backup.testCodeRegistry, auth?.schoolId) : null;
  if (codeRegistry && codeRegistry.keyId !== codeKeyId())
    fail("Test kodlari zaxirasi joriy server kalitiga mos emas.", 409);
  const encryptionKeyIds = Object.values(codeRegistry?.tests || {}).map((row) => row.encrypted.keyId).filter(Boolean);
  if (encryptionKeyIds.some((keyId) =>
    ![env('TEST_CODE_ENCRYPTION_KEY'), env('TEST_CODE_ENCRYPTION_KEY_PREVIOUS')]
      .filter(Boolean).some((key) => testCodeEncryptionKeyId(key) === keyId)))
    fail('Zaxiradagi test kodlari uchun joriy yoki oldingi shifrlash kaliti kerak.', 409);
  if (
    ![2, 3].includes(backup.version) ||
    (backup.version === 3 && backup.format !== 'nazorat-test-school-backup') ||
    !Array.isArray(backup.classes) ||
    !Array.isArray(backup.tests) ||
    !Array.isArray(backup.results)
  )
    fail('Zaxira formati yaroqsiz.');
  const fileHash = digest(backup);
  if (backup.classes.length > 200 || backup.tests.length > 1000 || backup.results.length > 20000)
    fail("Zaxirada yozuvlar juda ko'p.");
  const classes = backup.classes.map((c) => ({ ...classValid(c), id: validId(c.id),
    ...(typeof c.createdAt === 'string' && Number.isFinite(Date.parse(c.createdAt)) ? { createdAt: new Date(c.createdAt).toISOString() } : {}),
    ...(typeof c.updatedAt === 'string' && Number.isFinite(Date.parse(c.updatedAt)) ? { updatedAt: new Date(c.updatedAt).toISOString() } : {}) }));
  if (new Set(classes.map((c) => c.id)).size !== classes.length) fail('Zaxirada sinf ID takrorlangan.');
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const tests = backup.tests.map((raw) => restoreTest(raw, classMap));
  const results = backup.results.map(restoreResult);
  const [existingTests, existingClasses] = await Promise.all([testsRepo.list(true), classesRepo.list(true)]);
  const testIds = new Set([...existingTests.map((row) => row.id), ...tests.map((row) => row.id)]);
  const classIds = new Set([...existingClasses.map((row) => row.id), ...classes.map((row) => row.id)]);
  for (const result of results)
    if (!testIds.has(result.testId) || !classIds.has(result.classId)) fail('Natijaning testi yoki sinfi topilmadi.');
  if (
    new Set(tests.map((t) => t.id)).size !== tests.length ||
    new Set(results.map((r) => r.id)).size !== results.length
  )
    fail('Zaxirada ID takrorlangan.');
  for (const [rows, repo] of [[classes, classesRepo], [tests, testsRepo], [results, resultsRepo]])
    for (const row of rows) {
      const owner = await repo.ownerOf(row.id);
      if (owner.exists && owner.schoolId !== (auth?.schoolId || null))
        fail('Zaxirada boshqa egaga tegishli yozuv bor.', 403);
    }
  if (dryRun) {
    const currentFingerprint = await currentFingerprintForRows();
    const previewId = randomUUID();
    const resumes = (await previews.list()).filter((row) => row.fileHash === fileHash && row.schoolId === (auth?.schoolId || null) &&
      ['running', 'partial'].includes(row.state)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (resumes[0]?.state === 'running' && resumes[0].lockedUntil > Date.now())
      fail('Tiklash hali bajarilmoqda. Birozdan keyin yangi preview oling.', 409);
    const operationId = resumes[0]?.operationId || resumes[0]?.id || previewId;
    const existing = { classes: new Set(existingClasses.map((row) => row.id)), tests: new Set(existingTests.map((row) => row.id)), results: new Set((await resultsRepo.list(true)).map((row) => row.id)) };
    const counts = { added: 0, updated: 0 };
    for (const [name, rows] of Object.entries({ classes, tests, results }))
      for (const row of rows) counts[existing[name].has(row.id) ? 'updated' : 'added']++;
    const cleanBackup = { format: backup.format, version: backup.version, createdAt: backup.createdAt,
      sourceSchoolId: backup.sourceSchoolId ?? null, includes: backup.includes || [], excludes: backup.excludes || [],
      classes, tests, results, ...(codeRegistry ? { testCodeRegistry: codeRegistry } : {}) };
    await previews.save(previewId, { schoolId: auth?.schoolId || null, fileHash, currentFingerprint, data: cleanBackup, state: 'ready', operationId, createdAt: new Date().toISOString() });
    return { previewId, fileHash, counts, rejected: 0 };
  }
  const activeAttempts = await attemptsRepo.listPending();
  if (activeAttempts.length) fail('Faol urinishlar bor. Ular yakunlangach tiklashga qayting.', 409);
  const authSnapshot = currentAccess();
  const lockScope = authSnapshot?.schoolId || (authSnapshot?.role === 'legacy_admin' ? 'legacy' : null);
  if (lockScope) await restoreLocks.heartbeat(lockScope, operationId, authSnapshot.restoreClaimId);
  const protectedBackup = await backupData();
  const backupId = randomUUID();
  await archives.save(backupId, { createdAt: new Date().toISOString(), schoolId: authSnapshot?.schoolId || null, data: protectedBackup });
  if (lockScope) await restoreLocks.heartbeat(lockScope, operationId, authSnapshot.restoreClaimId);
  const categories = [['classes', classes, classesRepo], ['tests', tests, testsRepo], ['results', results, resultsRepo]];
  const report = { added: 0, updated: 0, errors: [] };
  let processed = 0;
  for (const [type, rows, repo] of categories) for (const row of rows) {
    try {
      const exists = await repo.find(row.id);
      await repo.save(row);
      report[exists ? 'updated' : 'added']++;
    } catch {
      report.errors.push({ type, id: row.id });
    }
    if (lockScope && ++processed % 20 === 0)
      await restoreLocks.heartbeat(lockScope, operationId, authSnapshot.restoreClaimId);
  }
  if (codeRegistry && auth?.schoolId) try {
    await codesRepo.update(auth.schoolId, () => codeRegistry);
  } catch {
    report.errors.push({ type: 'test-code-registry', id: auth.schoolId });
  }
  if (lockScope) await restoreLocks.heartbeat(lockScope, operationId, authSnapshot.restoreClaimId);
  await record('backup.restore', authSnapshot, report.errors.length ? 'partial' : 'success', operationId, {
    counts: { added: report.added, updated: report.updated, errors: report.errors.length },
  });
  return { ok: report.errors.length === 0, operationId, protectedBackupId: backupId, report };
}
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function currentFingerprintForRows() {
  const auth = currentAccess();
  return digest({ classes: await classesRepo.list(true), tests: await testsRepo.list(true),
    results: await resultsRepo.list(true), testCodeRegistry: auth?.schoolId ? await codesRepo.find(auth.schoolId) : null });
}
const currentFingerprint = currentFingerprintForRows;
export const previewRestore = (backup) => restoreData(backup, true);
export async function clearData(payload) {
  if (payload.confirmation !== 'HAMMASINI OCHIRISH') fail('Tozalash tasdiqlanmadi.');
  for (const repo of [testsRepo, resultsRepo, classesRepo, attemptsRepo, retakesRepo]) await repo.clear();
  return { ok: true };
}
