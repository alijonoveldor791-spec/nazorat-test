// API so'rovlari, sessiya tokeni, xatolar va serverdan chiqishni boshqaradi.
const TOKEN_KEY = 'nazorat-token';
export class ApiError extends Error {
  status;
  retryAfter;
  constructor(message, status = 500, retryAfter = 0) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}
export function setToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem('pw');
  } catch {
    /* ignore storage errors */
  }
}
export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
export async function api(path, options = {}) {
  const { token, timeoutMs = 15000, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  fetchOptions.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch('/api/' + path.replace(/^\/+/, ''), {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    let data;
    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted) throw new DOMException('Timeout', 'AbortError');
      throw new ApiError("Server javobi tushunarsiz. Qayta urinib ko'ring.", 502);
    }
    if (!response.ok) {
      const msg =
        (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error
          : null) || "So'rov bajarilmadi. Qayta urinib ko'ring.";
      throw new ApiError(msg, response.status, Number(response.headers.get('Retry-After')) || 0);
    }
    if (!data || typeof data !== 'object') {
      throw new ApiError('Serverdan yaroqli JSON kelmadi.', 502);
    }
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError("So'rov vaqti tugadi. Ma'lumotlaringiz saqlangan; qayta urinib ko'ring.", 408);
    }
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError) {
      throw new ApiError("Aloqa uzildi. Ma'lumotlaringizni saqlab, qayta urinib ko'ring.", 0);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    fetchOptions.signal?.removeEventListener('abort', abort);
  }
}
export const adminApi = (path, options = {}) =>
  api('admin/' + path.replace(/^\/+/, ''), { ...options, token: getToken() });
export const adminPost = (path, body, method = 'POST') =>
  adminApi(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
export const superApi = (path, methodOrOptions = 'GET', body) => {
  const options =
    typeof methodOrOptions === 'string'
      ? {
          method: methodOrOptions,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        }
      : methodOrOptions;
  return api('super-admin/' + path.replace(/^\/+/, ''), {
    ...options,
    token: getToken(),
  });
};
export async function logoutSession() {
  const token = getToken();
  if (token) {
    try {
      await api('admin/logout', { token, method: 'POST' });
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) throw error;
    }
  }
  clearToken();
}
