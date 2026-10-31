// repositories/settings-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
export const getAuth = () => blobs.get('settings', 'auth');
export const saveAuth = (value) => blobs.put('settings', 'auth', value);
export const updateAuth = (change) => blobs.update('settings', 'auth', change);
