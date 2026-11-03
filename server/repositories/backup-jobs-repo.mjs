// Avtomatik zaxiralash ishlarining oxirgi holatini saqlaydi.
import * as blobs from './blob-store.mjs';
export const save = (id, value) => blobs.put('backup-jobs', id, value);
export const find = (id) => blobs.get('backup-jobs', id);
