// OPC havolalarini faqat ZIP paket chegarasida yechadi; tarmoq yoki diskka chiqmaydi.
import { parseXml, elements, attr } from './docx-xml.mjs';
import { fail } from './http.mjs';
const PACKAGE_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
export function packageTarget(target, base = 'word/document.xml') {
  if (typeof target !== 'string' || !target || /[\\:#?\u0000-\u0020]/.test(target))
    fail("DOCX resurs yo'li noto'g'ri.");
  let decoded;
  try {
    decoded = decodeURIComponent(target);
  } catch {
    fail("DOCX resurs URI noto'g'ri.");
  }
  if (/[\\:#?\u0000-\u001f]/.test(decoded) || decoded.startsWith('//')) fail("DOCX resurs yo'li noto'g'ri.");
  const parts = decoded.startsWith('/') ? [] : base.split('/').slice(0, -1);
  for (const part of decoded.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (!parts.length) fail('DOCX havolasi paketdan tashqariga chiqadi.');
      parts.pop();
    } else parts.push(part);
  }
  if (!parts.length) fail("DOCX resurs yo'li bo'sh.");
  return parts.join('/');
}
export function documentRelationships(bytes, files) {
  const rels = new Map();
  if (!bytes) return rels;
  const root = parseXml(bytes);
  if (root.name !== 'Relationships' || root.uri !== PACKAGE_REL) fail("DOCX bog'lanish formati noto'g'ri.");
  const ids = new Set();
  for (const node of elements(root)) {
    if (node.uri !== PACKAGE_REL || node.name !== 'Relationship') fail("DOCX bog'lanish elementi noto'g'ri.");
    const id = attr(node, 'Id');
    if (!id || ids.has(id)) fail("DOCX bog'lanish IDsi takror yoki bo'sh.");
    ids.add(id);
    if (attr(node, 'TargetMode') === 'External') fail('Tashqi resursli Word fayli qabul qilinmaydi.');
    const target = packageTarget(attr(node, 'Target'));
    // Styles/customXml kabi metadata o'qilmaydi. Faqat rasm bog'lanishi renderga o'tadi.
    if (attr(node, 'Type') === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image') {
      if (!files.has(target)) fail('Word rasmi paket ichida topilmadi.');
      rels.set(id, target);
    }
  }
  return rels;
}
