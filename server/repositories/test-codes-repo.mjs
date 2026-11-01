// Bitta maktab registrini CAS bilan yangilab, kod va rezervni birga saqlaydi.
import * as blobs from './blob-store.mjs';
export const find = (schoolId) => blobs.get('test-codes', schoolId);
export const update = (schoolId, change) => blobs.update('test-codes', schoolId, change);
