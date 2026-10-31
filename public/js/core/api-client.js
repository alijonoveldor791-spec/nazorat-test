// core/api-client.js: sahifaning shu vazifasi uchun modul.
export async function api(path, {token, ...options} = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  let response;
  try { response = await fetch('/api/' + path, {...options, headers, cache:'no-store'}); }
  catch { throw new Error('Internet aloqasi yo’q. Qayta urinib ko’ring.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'So’rov bajarilmadi. Qayta urinib ko’ring.'); error.status = response.status; throw error; }
  return data;
}
