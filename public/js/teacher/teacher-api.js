// teacher/teacher-api.js: sahifaning shu vazifasi uchun modul.
import { api } from '../core/api-client.js';
import { getToken } from '../core/auth.js';
export const call = (path, options = {}) => api('admin/' + path, { token: getToken(), ...options });
export const post = (path, body = {}, method = 'POST') => call(path, { method, body: JSON.stringify(body) });
