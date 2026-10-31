// core/auth.js: sahifaning shu vazifasi uchun modul.
import { api } from './api-client.js';
import { toast } from '../components/toast.js';
export function getToken() {
  try {
    return sessionStorage.getItem('nazorat-token') || '';
  } catch {
    return '';
  }
}
export function setToken(token) {
  try {
    sessionStorage.setItem('nazorat-token', token);
    sessionStorage.removeItem('pw');
  } catch {}
}
export function clearToken() {
  try {
    sessionStorage.removeItem('nazorat-token');
  } catch {}
}
export async function logout() {
  const token = getToken();
  try {
    if (token) await api('admin/logout', { token, method: 'POST' });
  } catch (error) {
    if (error.status !== 401) {
      toast('Serverdan chiqish tasdiqlanmadi. Aloqa tiklangach qayta kiring va chiqing.', true);
      return;
    }
  }
  clearToken();
  location.assign('/oqituvchi/kirish.html');
}
