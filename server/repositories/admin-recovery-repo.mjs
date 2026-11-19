// Egasi tasdiqlagan tashqi Netlify muhitida bitta admin hisobini qayta tiklaydi.
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { fail } from '../lib/http.mjs';
export async function inspectAdmin(siteId, token, login) {
  return getStore({ name: 'admin-accounts', siteID: siteId, token, consistency: 'strong' })
    .get(login, { type: 'json' });
}
export async function recoverAdmin(siteId, token, login, password) {
  const store = getStore({ name: 'admin-accounts', siteID: siteId, token, consistency: 'strong' });
  const previous = await store.getWithMetadata(login, { type: 'json' });
  if (!previous || !['super_admin', 'school_admin'].includes(previous.data.role)) fail('Admin hisobi topilmadi.', 404);
  const auditStore = getStore({ name: 'audit-log', siteID: siteId, token, consistency: 'strong' });
  await auditStore.setJSON(randomUUID(), {
    at: new Date().toISOString(), action: 'admin.password_recovery', actorId: 'site-owner-cli',
    schoolId: previous.data.schoolId || null, objectId: login, outcome: 'initiated',
  });
  const updated = await store.setJSON(login, {
    ...previous.data, password, version: randomUUID(),
  }, { onlyIfMatch: previous.etag });
  if (!updated.modified) fail('Hisob parallel o\'zgargan; qayta tekshirib urinib ko\'ring.', 409);
  await auditStore.setJSON(randomUUID(), {
    at: new Date().toISOString(), action: 'admin.password_recovery', actorId: 'site-owner-cli',
    schoolId: previous.data.schoolId || null, objectId: login, outcome: 'success',
  });
  return { login: previous.data.login, role: previous.data.role, schoolId: previous.data.schoolId, versionChanged: true };
}
