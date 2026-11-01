// Maktab ID rezervi, parallel yaratish va uzilishdan keyingi idempotent tiklash.
import { randomUUID } from 'node:crypto';
import * as schools from '../repositories/schools-repo.mjs';
import * as requests from '../repositories/school-requests-repo.mjs';
import * as publicIds from '../repositories/public-school-ids-repo.mjs';
import { hash } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';
import { requireRole } from '../lib/access-context.mjs';
export async function createSchool(auth, name, region, requestId = randomUUID()) {
  requireRole(auth, ['super_admin']);
  if (
    typeof requestId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
  )
    fail("So'rov IDsi noto'g'ri.");
  const key = auth.id + '-' + requestId.toLowerCase();
  const requestHash = hash(JSON.stringify({ name, region }));
  let reserved = await requests.update(key, (old) => {
    if (old && old.requestHash !== requestHash) fail("Bu so'rov boshqa maktabni yaratgan.", 409);
    return old || { schoolId: randomUUID(), requestHash, createdAt: new Date().toISOString() };
  });
  for (let index = 0; index < 5; index++) {
    const registry = await publicIds.reserve(await schools.list(), [reserved.schoolId]);
    const row = {
      id: reserved.schoolId,
      public_school_id: registry.bySchool[reserved.schoolId],
      name,
      region,
      status: 'active',
      createdAt: reserved.createdAt,
      updatedAt: reserved.createdAt,
      subscription: null,
      creationKey: key,
    };
    if (await schools.create(row)) return row;
    const existing = await schools.find(row.id);
    if (existing?.creationKey === key) {
      if (existing.public_school_id) return existing;
      return schools.update(existing.id, (current) => ({
        ...current,
        public_school_id: current.public_school_id || row.public_school_id,
      }));
    }
    reserved = await requests.update(key, (current) =>
      current.schoolId === row.id ? { ...current, schoolId: randomUUID() } : current
    );
  }
  fail("Noyob maktab IDsi band qilinmadi. Qayta urinib ko'ring.", 409);
}
