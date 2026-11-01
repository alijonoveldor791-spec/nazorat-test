// Bosh admin uchun faqat sanog'larni hisoblaydi; individual yozuvlarni qaytarmaydi.
import { store } from './blob-store.mjs';
export async function countsBySchool(name) {
  const counts = new Map();
  for await (const { blobs } of store(name).list({ paginate: true })) {
    const rows = await Promise.all(blobs.map((blob) => store(name).get(blob.key, { type: 'json' })));
    for (const row of rows) {
      if (!row) continue;
      const schoolId = typeof row.schoolId === 'string' ? row.schoolId : null;
      counts.set(schoolId, (counts.get(schoolId) || 0) + 1);
    }
  }
  return counts;
}
