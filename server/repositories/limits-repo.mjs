// repositories/limits-repo.mjs: serverdagi shu qatlam vazifasi.
import { update } from './blob-store.mjs';
export const updateCounter = (key, change) => update('limits', key, change);
