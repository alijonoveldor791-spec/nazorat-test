// DOCX ZIP arxivini ochishdan oldin hajm, yo'l va faol fayllarni tekshiradi.
import { unzipSync } from 'fflate';
import { fail } from './http.mjs';

const LIMITS = { upload: 4_000_000, expanded: 20_000_000, entry: 8_000_000, count: 500 };
const EOCD = 0x06054b50, CENTRAL = 0x02014b50;
function entries(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (bytes.readUInt32LE(i) === EOCD) { end = i; break; }
  if (end < 0) fail('DOCX ZIP arxivi buzilgan.');
  const count = bytes.readUInt16LE(end + 10), size = bytes.readUInt32LE(end + 12);
  let offset = bytes.readUInt32LE(end + 16), total = 0;
  if (!count || count > LIMITS.count || count === 0xffff || size === 0xffffffff || offset + size > end)
    fail('DOCX ichidagi qismlar soni yoki ZIP64 formati qo\'llanmaydi.');
  const names = new Set();
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || bytes.readUInt32LE(offset) !== CENTRAL) fail('DOCX arxiv indeksi buzilgan.');
    const flags = bytes.readUInt16LE(offset + 8), method = bytes.readUInt16LE(offset + 10);
    const packed = bytes.readUInt32LE(offset + 20), expanded = bytes.readUInt32LE(offset + 24);
    const n = bytes.readUInt16LE(offset + 28), x = bytes.readUInt16LE(offset + 30), c = bytes.readUInt16LE(offset + 32);
    const name = bytes.subarray(offset + 46, offset + 46 + n).toString('utf8');
    if (offset + 46 + n + x + c > end || !name || name.startsWith('/') || name.includes('..') || name.includes('\\') || names.has(name))
      fail('DOCX ichida xavfli yoki takroriy fayl yo\'li bor.');
    if ((flags & 1) || ![0, 8].includes(method)) fail('Shifrlangan yoki noma\'lum ZIP qismi rad etildi.');
    if (expanded > LIMITS.entry || (packed && expanded / packed > 200)) fail('DOCX ichidagi fayl hajmi xavfsizlik limitidan oshdi.');
    if (/vbaProject|\.(?:exe|dll|js|mjs)$/i.test(name)) fail('Makros yoki bajariladigan qism bor Word fayli rad etildi.');
    names.add(name); total += expanded; offset += 46 + n + x + c;
  }
  if (total > LIMITS.expanded) fail('DOCX ochilganda 20 MB dan oshadi.');
  return names;
}
export function openDocx(input) {
  const bytes = Buffer.from(input);
  if (bytes.length > LIMITS.upload) fail('Word fayli 4 MB dan oshmasin.');
  if (bytes.length < 4 || bytes.readUInt32LE(0) !== 0x04034b50) fail('DOCX ZIP imzosi topilmadi.');
  const started = Date.now(), names = entries(bytes);
  let files;
  try { files = unzipSync(bytes); } catch { fail('DOCX ZIP qismi buzilgan yoki noto\'g\'ri siqilgan.'); }
  if (Date.now() - started > 5000) fail('DOCX tahlili 5 soniyadan oshdi. Kichikroq faylni tanlang.');
  for (const name of ['[Content_Types].xml', 'word/document.xml'])
    if (!names.has(name) || !files[name]) fail('DOCX tuzilmasi to\'liq emas.');
  return { names, files };
}
