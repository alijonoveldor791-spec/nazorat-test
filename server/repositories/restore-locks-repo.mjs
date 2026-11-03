// Tiklash davrida bir maktabning boshqa yozuvlarini vaqtincha bloklaydi.
import * as blobs from './blob-store.mjs';
import { fail } from '../lib/http.mjs';
export const acquire = (scope, operationId, claimId) => blobs.update('backup-locks', scope, (current) => {
  if (current?.until > Date.now() && current.claimId !== claimId)
    fail('Maktab ma\'lumotlari tiklanmoqda. Keyinroq qayta urinib ko\'ring.', 409);
  return { operationId, claimId, until: Date.now() + 300000 };
});
export const heartbeat = (scope, operationId, claimId) => blobs.update('backup-locks', scope, (current) => {
  if (current?.operationId !== operationId || current?.claimId !== claimId) fail('Tiklash qulfi yo\'qolgan.', 409);
  return { ...current, until: Date.now() + 300000 };
});
export const release = (scope, operationId, claimId) => blobs.update('backup-locks', scope, (current) =>
  current?.operationId === operationId && current?.claimId === claimId ? null : current
);
