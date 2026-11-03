// DOCX asl manbasini faqat maktab doirasidagi xususiy omborda saqlaydi.
import * as blobs from './blob-store.mjs';
export const create = (row) => blobs.create('import-sources', row.id, row);
export const find = (id) => blobs.get('import-sources', id);
