// Chegaralangan kutish, to’g’ri JSON va qayta urinish ma’lumotlari bilan API client.
export async function api(path, { token, timeoutMs = 15000, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  const controller = new AbortController(),
    abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch('/api/' + path, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    let data;
    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted) throw new DOMException('Timeout', 'AbortError');
      const error = new Error('Server javobi tushunarsiz. Qayta urinib ko’ring.');
      error.status = 502;
      throw error;
    }
    if (!response.ok) {
      const error = new Error(data?.error || 'So’rov bajarilmadi. Qayta urinib ko’ring.');
      error.status = response.status;
      error.retryAfter = Number(response.headers.get('Retry-After')) || 0;
      throw error;
    }
    if (!data || typeof data !== 'object') {
      const error = new Error('Serverdan yaroqli JSON kelmadi.');
      error.status = 502;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError')
      throw new Error('So’rov vaqti tugadi. Ma’lumotlaringiz saqlangan; qayta urinib ko’ring.');
    if (error.status) throw error;
    if (error instanceof TypeError)
      throw new Error('Aloqa uzildi. Ma’lumotlaringizni saqlab, qayta urinib ko’ring.');
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
