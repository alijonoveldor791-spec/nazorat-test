// core/auth.js: sahifaning shu vazifasi uchun modul.
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
export function logout() {
  clearToken();
  location.assign('/oqituvchi/kirish.html');
}
