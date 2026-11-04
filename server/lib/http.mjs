// lib/http.mjs: serverdagi shu qatlam vazifasi.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const fail = (message, status = 400) => {
  throw new HttpError(status, message);
};
export const json = (value, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
export async function readJson(req) {
  const maximum = 4_000_000;
  if (Number(req.headers.get('content-length')) > maximum) fail("So'rov 4 MB dan oshmasin.", 413);
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    fail("Content-Type application/json bo'lsin.", 415);
  const reader = req.body?.getReader(),
    chunks = [];
  let length = 0;
  if (reader)
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) {
        await reader.cancel();
        fail("So'rov 4 MB dan oshmasin.", 413);
      }
      chunks.push(value);
    }
  const text = new TextDecoder().decode(Buffer.concat(chunks));
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('JSON obyekt kutilgan.');
    return value;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    fail("JSON formati noto'g'ri.");
  }
}

export async function readForm(req) {
  const maximum = 4_000_000;
  if (Number(req.headers.get('content-length')) > maximum) fail("Fayl 4 MB dan oshmasin.", 413);
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data'))
    fail("Fayl uchun multipart/form-data yuboring.", 415);
  const reader = req.body?.getReader(), chunks = [];
  let length = 0;
  if (reader) for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maximum) { await reader.cancel(); fail("Fayl 4 MB dan oshmasin.", 413); }
    chunks.push(Buffer.from(value));
  }
  let form;
  try {
    const copy = new Request(req.url, { method: 'POST', headers: req.headers, body: Buffer.concat(chunks) });
    form = await copy.formData();
  } catch { fail('Yuklangan fayl formati noto\'g\'ri.'); }
  if ([...form.keys()].some((key) => key !== 'file') || form.getAll('file').length !== 1)
    fail("Faqat bitta 'file' maydonini yuboring.");
  const file = form.get('file');
  if (!(file instanceof File) || !file.size) fail('DOC yoki DOCX faylni tanlang.');
  return { name: file.name, type: file.type, file: Buffer.from(await file.arrayBuffer()) };
}
