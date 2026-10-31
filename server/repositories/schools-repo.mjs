// Minimal maktab boshqaruv yozuvlarini saqlaydi; eski yozuvlarni ko‘chirmaydi.
import * as blobs from './blob-store.mjs';
export const list = () => blobs.all('schools', true);
export const find = (id) => blobs.get('schools', id);
export const create = (row) => blobs.create('schools', row.id, row);
export const update = (id, change) => blobs.update('schools', id, change);
