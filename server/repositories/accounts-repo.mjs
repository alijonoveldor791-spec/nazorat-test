// Admin hisoblarini login bo‘yicha atomik yaratadi; parollar faqat hash ko‘rinishida.
import * as blobs from './blob-store.mjs';
export const find = (login) => blobs.get('admin-accounts', login);
export const create = (row) => blobs.create('admin-accounts', row.login, row);
export const update = (login, change) => blobs.update('admin-accounts', login, change);
