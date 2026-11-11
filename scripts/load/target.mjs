// Faqat tasdiqlangan alohida sinov manziliga yozishga ruxsat beradi.
export function loadTarget(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw Error('Faqat HTTP(S).');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw Error('Faqat origin kiriting.');
  if (
    !local &&
    (process.env.LOAD_ENVIRONMENT !== 'staging' ||
      process.env.LOAD_TARGET_CONFIRMED !== url.origin ||
      !process.env.PRODUCTION_ORIGIN ||
      new URL(process.env.PRODUCTION_ORIGIN).origin === url.origin ||
      url.protocol !== 'https:')
  )
    throw Error(
      'Production taqiqlangan. Alohida staging, PRODUCTION_ORIGIN va aniq LOAD_TARGET_CONFIRMED kerak.'
    );
  return { baseUrl: url.origin, environment: local ? 'local-emulator' : 'staging' };
}
export function client(baseUrl, token) {
  return async (path, body, method = body ? 'POST' : 'GET') => {
    const response = await fetch(baseUrl + '/api/' + path, {
      method,
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(120000),
    });
    let value;
    try { value = await response.json(); } catch { throw Error(`${method} ${path}: ${response.status}, JSON bolmagan javob.`); }
    if (!response.ok) throw Error(`${method} ${path}: ${response.status} ${value.error}`);
    return value;
  };
}
