// repositories/limits-repo.mjs: serverdagi shu qatlam vazifasi.
import { update, get } from './blob-store.mjs';
export const updateCounter = (key, change) => update('limits', key, change);
export const findCounter = (key) => get('limits', key);
