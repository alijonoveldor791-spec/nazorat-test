// Muhim admin amallarini maxfiy qiymatlarsiz server jurnaliga qo'shadi.
import { randomUUID } from 'node:crypto';
import * as auditRepo from '../repositories/audit-repo.mjs';
export const auditEvent = (event) =>
  auditRepo.append(randomUUID(), {
    at: new Date().toISOString(),
    action: event.action,
    actorId: event.actorId || null,
    schoolId: event.schoolId || null,
    objectId: event.objectId || null,
    outcome: event.outcome,
    ...(event.statusCode ? { statusCode: event.statusCode } : {}),
  });
