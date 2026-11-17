// Mavzularni maktab egaligi va restore-lock bilan saqlaydi; tiklash ham shu adapterdan o'tadi.
import * as blobs from './blob-store.mjs';
export const list = () => blobs.all('school-topics', true);
export const find = (id) => blobs.get('school-topics', id);
export const create = (row) => blobs.create('school-topics', row.id, row);
export const update = (id, change) => blobs.update('school-topics', id, change);
export const save = (row) => blobs.put('school-topics', row.id, row);
export const ownerOf = (id) => blobs.owner('school-topics', id);
