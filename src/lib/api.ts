const TOKEN_KEY = 'nazorat-token';

export class ApiError extends Error {
  status: number;
  retryAfter: number;
  constructor(message: string, status = 500, retryAfter = 0) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function getToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem('pw');
  } catch {
    /* ignore storage errors */
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { token?: string; timeoutMs?: number } = {}
): Promise<T> {
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
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted) throw new DOMException('Timeout', 'AbortError');
      throw new ApiError("Server javobi tushunarsiz. Qayta urinib ko'ring.", 502);
    }
    if (!response.ok) {
      const msg =
        (data && typeof data === 'object' && 'error' in data && typeof (data as { error?: unknown }).error === 'string'
          ? (data as { error: string }).error
          : null) || "So'rov bajarilmadi. Qayta urinib ko'ring.";
      throw new ApiError(msg, response.status, Number(response.headers.get('Retry-After')) || 0);
    }
    if (!data || typeof data !== 'object') {
      throw new ApiError('Serverdan yaroqli JSON kelmadi.', 502);
    }
    return data as T;
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

export const adminApi = <T = unknown>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
) => api<T>('admin/' + path.replace(/^\/+/, ''), { ...options, token: getToken() });

export const adminPost = <T = unknown>(
  path: string,
  body?: unknown,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) =>
  adminApi<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

export const superApi = <T = unknown>(
  path: string,
  methodOrOptions: 'GET' | 'POST' | 'PUT' | 'DELETE' | (RequestInit & { timeoutMs?: number }) = 'GET',
  body?: unknown
) => {
  const options: RequestInit & { timeoutMs?: number } =
    typeof methodOrOptions === 'string'
      ? {
          method: methodOrOptions,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        }
      : methodOrOptions;
  return api<T>('super-admin/' + path.replace(/^\/+/, ''), {
    ...options,
    token: getToken(),
  });
};

export async function logoutSession(): Promise<void> {
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
