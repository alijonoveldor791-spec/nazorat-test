// Admin sessiyalarini serverda bekor qilish uchun saqlaydi.
import * as blobs from './blob-store.mjs';
export const find = (id) => blobs.get('sessions', id);
export const save = (row) => blobs.put('sessions', row.id, row);
export const remove = (id) => blobs.remove('sessions', id);
