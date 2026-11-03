// Tiklashdan oldingi himoyalangan nusxalarni va davom ettirish holatini saqlaydi.
import * as blobs from './blob-store.mjs';
export const save = (id, value) => blobs.create('backup-archives', id, value);
export const find = (id) => blobs.get('backup-archives', id);
export const list = () => blobs.all('backup-archives', true);
