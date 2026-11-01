// Minimal maktab boshqaruv yozuvlarini saqlaydi; eski yozuvlarni ko‘chirmaydi.
import * as blobs from './blob-store.mjs';
export const list = () => blobs.all('schools', true);
export async function find(id) {
  const row = await blobs.get('schools', id);
  return row ? { ...row, id: row.id || id } : null;
}
export const create = (row) => blobs.create('schools', row.id, row);
export const update = (id, change) =>
  blobs.update('schools', id, (row) => change(row ? { ...row, id: row.id || id } : null));
