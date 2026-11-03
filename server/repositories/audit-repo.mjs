// Faqat server yozadigan append-only audit yozuvlarini saqlaydi.
import * as blobs from './blob-store.mjs';
export const append = (id, value) => blobs.create('audit-log', id, value);
