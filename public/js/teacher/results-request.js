// Natijalarni faqat tanlov yoki yangilash so'rovi bilan yuklaydi; eski javobni bekor qiladi.
import { call } from './teacher-api.js';
import { setResults } from './data.js';
let controller;
let version = 0;
export const resultRequest = {
  ready: false,
  message: "Natijalarni ko'rish uchun test yoki guruh tanlang yoki Yangilash tugmasini bosing.",
};
export async function requestResults(filters, explicit = false) {
  const current = ++version;
  controller?.abort();
  resultRequest.ready = false;
  resultRequest.message =
    "Natijalarni ko'rish uchun test yoki guruh tanlang yoki Yangilash tugmasini bosing.";
  if (!explicit && !filters.testId && !filters.classId) {
    setResults([]);
    return;
  }
  controller = new AbortController();
  resultRequest.message = 'Natijalar yuklanmoqda...';
  setResults([]);
  try {
    const query = new URLSearchParams();
    if (filters.testId) query.set('testId', filters.testId);
    if (filters.classId) query.set('classId', filters.classId);
    const rows = await call('results?' + query, { signal: controller.signal });
    if (current !== version) return;
    resultRequest.ready = true;
    setResults(rows);
  } catch (error) {
    if (current !== version) return;
    resultRequest.message = error.message + ' Yangilash tugmasi orqali qayta urining.';
    setResults([]);
  }
}
