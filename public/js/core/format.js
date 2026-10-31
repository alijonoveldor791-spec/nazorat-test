// core/format.js: sahifaning shu vazifasi uchun modul.
export const percent = (row) => (row.total ? Math.round((row.score / row.total) * 100) : 0);
export const dateTime = (value) =>
  value ? new Date(value).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }) : '—';
