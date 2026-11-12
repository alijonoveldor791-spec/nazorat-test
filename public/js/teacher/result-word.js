// Admin tokenini URLga yozmasdan yakuniy test varaqasini Word sifatida yuklaydi.
import { getToken } from '../core/auth.js';
import { download } from '../core/download.js';
import { toast } from '../components/toast.js';
const MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export async function downloadResultWord(id) {
  const controller = new AbortController(),
    timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('/api/admin/results/' + encodeURIComponent(id) + '/word', {
      headers: { Authorization: 'Bearer ' + getToken() },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error || "Word faylni yuklab bo'lmadi.");
    }
    if (!response.headers.get('content-type')?.startsWith(MIME))
      throw new Error('Server Word fayl qaytarmadi.');
    let filename = 'test-varaqasi.docx';
    const encoded = /filename\*=UTF-8''([^;]+)/i.exec(response.headers.get('content-disposition') || '')?.[1];
    if (encoded) {
      try {
        filename = decodeURIComponent(encoded);
      } catch {}
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    download(filename, bytes, MIME);
    toast('Word varaqasi yuklandi.');
  } catch (error) {
    if (error.name === 'AbortError')
      throw new Error("Word faylni tayyorlash vaqti tugadi. Qayta urinib ko'ring.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
