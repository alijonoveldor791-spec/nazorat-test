// Maktab yaratish so'rovining o'zgarmas rezervini atomik saqlaydi.
import * as blobs from './blob-store.mjs';
export const update = (key, change) => blobs.update('school-requests', key, change);
