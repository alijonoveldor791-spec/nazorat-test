// DOCXni tuzilmasi bilan o'qib, boy savol/variant va to'g'ri javob previewini tuzadi.
import { posix as path } from 'node:path';
import { openDocx } from '../lib/docx-archive.mjs';
import { parseXml, children, nameOf, textOf, attr, find, serialize } from '../lib/docx-xml.mjs';
import { toMathml } from '../lib/omml-mathml.mjs';
import { richHtml } from '../lib/rich-content.mjs';
import { fail } from '../lib/http.mjs';
import { env } from '../lib/env.mjs';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const esc = (value) => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function parsePart(files, name) {
  if (!files[name]) return null;
  return parseXml(files[name], name);
}
function relationships(files, names) {
  const file = 'word/_rels/document.xml.rels', doc = parsePart(files, file), result = new Map();
  for (const rel of doc?.getElementsByTagName('Relationship') || []) {
    if (rel.getAttribute('TargetMode') === 'External') fail("DOCX tashqi resursga havola qiladi; import xavfsizlik uchun to'xtatildi.");
    const target = path.normalize(path.join('word', rel.getAttribute('Target') || ''));
    if (target.startsWith('../') || !names.has(target)) fail('DOCX ichki media havolasi topilmadi.');
    result.set(rel.getAttribute('Id'), target);
  }
  return result;
}
function mediaFor(node, rels, files, budget) {
  const blips = node.getElementsByTagNameNS('*', 'blip');
  const image = blips[0];
  if (!image) fail("Word diagrammasi uchun ko'rish nusxasi yo'q; rasm fallback qo'shing.");
  const target = rels.get(image.getAttributeNS(R, 'embed') || image.getAttribute('r:embed'));
  if (!target) fail('DOCX rasm munosabati topilmadi.');
  const ext = target.split('.').at(-1).toLowerCase(), mime = ({ png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', webp:'image/webp' })[ext];
  const data = files[target];
  if (!mime || !data) fail("Rasm faqat PNG, JPEG, GIF yoki WEBP bo'lsin; SVG va tashqi rasm qabul qilinmaydi.");
  const bytes = Buffer.from(data), valid = mime === 'image/png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : mime === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : mime === 'image/gif' ? ['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString())
        : bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
  if (!valid) fail('DOCX ichidagi rasm buzilgan yoki MIME turi mos emas.');
  budget.media += data.length;
  if (++budget.images > 20 || budget.media > 1_000_000) fail('Rasm soni yoki umumiy media hajmi import limitidan oshdi.');
  const alt = node.getElementsByTagNameNS('*', 'docPr')[0]?.getAttribute('descr') || '';
  return { html: `<img src="data:${mime};base64,${Buffer.from(data).toString('base64')}" alt="${esc(alt)}"/>`, text: alt || '[Rasm]' };
}
function runText(node) {
  const parts = [];
  for (const child of children(node)) {
    const tag = nameOf(child);
    if (tag === 't') parts.push(textOf(child));
    else if (tag === 'tab') parts.push('\t');
    else if (tag === 'br' || tag === 'cr') parts.push('\n');
  }
  return parts.join('');
}
function inline(node, budget) {
  const tag = nameOf(node);
  if (tag === 'r') return runHtml(node, budget);
  if (tag === 'oMath' || tag === 'oMathPara') return { html: toMathml(node), text: textOf(node) };
  if (['bookmarkStart','bookmarkEnd','commentRangeStart','commentRangeEnd','proofErr','pPr','rPr'].includes(tag)) return { html:'', text:'' };
  if (['hyperlink','sdt','sdtContent','smartTag','customXml','ins','del','moveFrom','moveTo'].includes(tag)) {
    const items = children(node).map((child) => inline(child, budget));
    return { html:items.map((item) => item.html).join(''), text:items.map((item) => item.text).join('') };
  }
  if (textOf(node).trim()) fail(`Word '${tag}' elementi tarkibni yo'qotishi mumkin; import to'xtatildi.`);
  return { html:'', text:'' };
}
function runHtml(run, budget) {
  const props = find(run, 'rPr'), values = [];
  for (const child of children(run)) {
    const tag = nameOf(child);
    if (tag === 'rPr') continue;
    if (tag === 't') values.push(esc(textOf(child)).replaceAll('\n','<br/>').replaceAll('\t','&#9;'));
    else if (tag === 'tab') values.push('&#9;');
    else if (tag === 'br' || tag === 'cr') values.push('<br/>');
    else if (tag === 'drawing') values.push(mediaFor(child, budget.rels, budget.files, budget));
    else if (tag === 'object' || tag === 'pict') fail("MathType/OLE yoki VML obyekt aniqlandi. Uni MathMLga o'girish uchun MATHTYPE_CONVERTER_URL xizmati kerak.");
    else if (tag === 'oMath' || tag === 'oMathPara') values.push({ html: toMathml(child), text: textOf(child) });
  }
  let html = values.map((part) => typeof part === 'string' ? part : part.html).join('');
  const text = values.map((part) => typeof part === 'string' ? part.replace(/<[^>]*>/g,'') : part.text).join('');
  const wrapping = [['b','strong'],['i','em'],['u','u'],['strike','s']];
  for (const [prop, tag] of wrapping) {
    const value = find(props, prop);
    if (value && attr(value, 'val') !== '0' && attr(value, 'val') !== 'none' && attr(value, 'val') !== 'false') html = `<${tag}>${html}</${tag}>`;
  }
  const vertical = attr(find(props, 'vertAlign'), 'val');
  if (vertical === 'superscript' || vertical === 'subscript') html = `<${vertical === 'superscript' ? 'sup' : 'sub'}>${html}</${vertical === 'superscript' ? 'sup' : 'sub'}>`;
  const style = [], color = attr(find(props, 'color'), 'val'), highlight = attr(find(props, 'highlight'), 'val');
  const size = Number(attr(find(props, 'sz'), 'val')) / 2, font = attr(find(props, 'rFonts'), 'ascii');
  if (/^[0-9a-f]{6}$/i.test(color)) style.push(`color:#${color}`);
  const highlights = { yellow:'#ffff00', green:'#00ff00', cyan:'#00ffff', magenta:'#ff00ff', blue:'#0000ff', red:'#ff0000', darkBlue:'#00008b', darkRed:'#8b0000', darkGreen:'#006400', darkGray:'#a9a9a9', lightGray:'#d3d3d3', black:'#000000', white:'#ffffff' };
  if (highlights[highlight]) style.push(`background-color:${highlights[highlight]}`);
  if (Number.isFinite(size) && size >= 1 && size <= 100) style.push(`font-size:${size}pt`);
  if (/^[A-Za-z0-9 -]{1,60}$/.test(font)) style.push(`font-family:${font}`);
  if (style.length) html = `<span style="${style.join(';')}">${html}</span>`;
  return { html, text };
}
function renderNode(node, budget) {
  const tag = nameOf(node);
  if (tag === 'p') {
    const contents = children(node).map((child) => inline(child, budget));
    const text = contents.map((item) => item.text).join('');
    const align = attr(find(find(node, 'pPr'), 'jc'), 'val');
    const style = ['center','right','left','both'].includes(align) ? ` style="text-align:${align === 'both' ? 'justify' : align}"` : '';
    const numbered = !!find(find(node, 'pPr'), 'numPr');
    const listMark = numbered ? '• ' : '';
    return { html: `<p${style}>${listMark}${contents.map((item) => item.html).join('')}</p>`, text: listMark + text, numbered };
  }
  if (tag === 'tbl') {
    const rows = children(node).filter((row) => nameOf(row) === 'tr').map((row) => children(row).filter((cell) => nameOf(cell) === 'tc').map((cell) => {
      const items = children(cell).map((part) => renderNode(part, budget));
      return { html:`<td>${items.map((item) => item.html).join('')}</td>`, text:items.map((item) => item.text).join(' ') };
    }));
    return { html:`<table><tbody>${rows.map((row) => `<tr>${row.map((cell) => cell.html).join('')}</tr>`).join('')}</tbody></table>`, text:rows.map((row) => row.map((cell) => cell.text).join(' ')).join(' ') };
  }
  return { html:'', text:'' };
}
function stripPrefix(html, prefix) {
  const doc = parseXml(Buffer.from(`<root>${html}</root>`), 'Savol previewi'), root = doc.documentElement;
  let left = prefix.length;
  const visit = (node) => {
    if (node.nodeType === 3 && left) { const count = Math.min(left, node.nodeValue.length); node.nodeValue = node.nodeValue.slice(count); left -= count; }
    for (const child of Array.from(node.childNodes || [])) visit(child);
  };
  visit(root);
  if (left) fail('Variant boshidagi belgi markupdan ajratilmadi.');
  return children(root).map(serialize).join('');
}
function makeQuestions(blocks) {
  const questions = []; let current = null;
  const finish = () => {
    if (!current) return;
    if (!current.q.trim() || current.options.length < 2 || current.options.length > 6)
      fail("Har savolda matn va 2–6 ta variant bo'lsin.");
    const marked = current.options.filter((option) => option.correct);
    if (marked.length !== 1) fail("Har savolda aynan bitta variant boshida #B. yoki # B. belgisi bo'lsin.");
    questions.push({ contentFormat:'rich-html-v1', q:richHtml(current.q), options:current.options.map((o) => richHtml(o.html)), answer:current.options.indexOf(marked[0]) });
  };
  for (const block of blocks) {
    const text = block.text.replace(/\s+/g,' ').trim(); if (!text) continue;
    const numbered = /^\d{1,3}[.)]\s+/.exec(text);
    if ((numbered || block.numbered) && current?.options.length) { finish(); current = null; }
    if (!current) current = { q:'', options:[] };
    if (numbered || block.numbered) {
      current.q += stripPrefix(block.html, numbered?.[0] || '• ');
      continue;
    }
    const marked = /^\s*#\s*([A-F])\.\s*/i.exec(text), option = /^\s*([A-F])[.)]\s*/i.exec(text);
    if (marked || option) {
      if (!current.q.trim()) fail("Variantlardan oldin savol matni bo'lsin.");
      const match = marked || option, letter = match[1].toUpperCase();
      if (letter.charCodeAt(0) - 65 !== current.options.length) fail("Variant harflari A dan boshlab ketma-ket bo'lsin.");
      current.options.push({ html:stripPrefix(block.html, match[0]), correct:!!marked });
    } else if (current.options.length) current.options.at(-1).html += block.html;
    else current.q += block.html;
  }
  finish();
  if (!questions.length || questions.length > 200) fail("Word faylidan 1–200 ta to'liq savol topilmadi.");
  return questions;
}
export function previewDocx(input) {
  const { names, files } = openDocx(input), budget = { files, names, rels:null, media:0, images:0 };
  const types = parsePart(files, '[Content_Types].xml');
  if (/macroEnabled|vbaProject/i.test(Buffer.from(files['[Content_Types].xml']).toString('utf8'))) fail('Makrosiz DOCX faylni tanlang.');
  if ([...names].some((name) => name.startsWith('word/embeddings/')))
    fail('MathType/OLE formulani DOC_MATH_CONVERTER_URL xizmati OMML/MathML manbasini saqlab aylantirmaguncha fayl saqlanmadi.');
  for (const name of names) if (name.endsWith('.rels')) {
    const relDoc = parsePart(files, name);
    if ([...(relDoc?.getElementsByTagName('Relationship') || [])].some((rel) => rel.getAttribute('TargetMode') === 'External'))
      fail("DOCX tashqi resurs havolasini o'z ichiga oladi; xavfsizlik uchun import to'xtatildi.");
  }
  budget.rels = relationships(files, names);
  const doc = parsePart(files, 'word/document.xml'), body = doc.getElementsByTagNameNS(W, 'body')[0];
  if (!body) fail('DOCX hujjat tanasi topilmadi.');
  if (['headerReference','footerReference','footnoteReference','endnoteReference','commentReference']
    .some((tag) => doc.getElementsByTagNameNS(W, tag).length))
    fail("DOCX header/footer, izoh yoki footnote contentiga ega. Yo'qolishni oldini olish uchun ularni hujjat tanasiga ko'chiring.");
  const blocks = children(body).map((node) => renderNode(node, budget)).filter((item) => item.text.trim());
  const questions = makeQuestions(blocks);
  return { questions, warnings:[], status:'complete' };
}

async function convertFile(urlValue, token, file, name, operation) {
  let url;
  try { url = new URL(urlValue); } catch { fail(`${operation}: Netlify muhitida converter URL noto'g'ri.`, 503); }
  const local = ['localhost','127.0.0.1'].includes(url.hostname) && env('NETLIFY_DEV') === 'true';
  if (url.protocol !== 'https:' && !local) fail(`${operation}: HTTPS manzili kerak.`, 503);
  const body = new FormData();
  body.append('file', new Blob([file]), name);
  let response;
  try {
    response = await fetch(url, { method:'POST', body, headers:{ Authorization:`Bearer ${token}` }, redirect:'error', signal:AbortSignal.timeout(10000) });
  } catch { fail(`${operation} xizmatiga ulanib bo'lmadi. Netlify Site configuration → Environment variables ichida URL va tokenni tekshiring.`, 503); }
  if (!response.ok) fail(`${operation} xizmati ${response.status} xato qaytardi. Xizmat loglarini tekshiring.`, 502);
  if (!response.headers.get('content-type')?.includes('wordprocessingml.document'))
    fail(`${operation} xizmati haqiqiy DOCX qaytarmadi.`, 502);
  const reader = response.body?.getReader(), chunks = []; let size = 0;
  if (reader) for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength; if (size > 4_000_000) { await reader.cancel(); fail('Converter natijasi 4 MB dan oshdi.', 413); }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export async function previewWordFile(file, filename) {
  const extension = filename.toLowerCase().split('.').at(-1);
  let docx = file;
  if (extension === 'doc') {
    const url = env('DOC_CONVERTER_URL'), token = env('DOC_CONVERTER_TOKEN');
    if (!url || !token) fail('Eski .doc uchun DOC_CONVERTER_URL va DOC_CONVERTER_TOKEN Netlify environment variables sifatida sozlansin. DOCX fayl converter talab qilmaydi.', 503);
    docx = await convertFile(url, token, file, filename, 'DOC konvertori');
  } else if (extension !== 'docx') fail('Faqat haqiqiy .doc yoki .docx Word fayl qabul qilinadi.');
  const archive = openDocx(docx);
  if ([...archive.names].some((name) => name.startsWith('word/embeddings/'))) {
    const url = env('DOC_MATH_CONVERTER_URL'), token = env('DOC_MATH_CONVERTER_TOKEN');
    if (!url || !token) fail('MathType/OLE formulalari uchun DOC_MATH_CONVERTER_URL va DOC_MATH_CONVERTER_TOKEN kerak; Netlify environment variables sozlang.', 503);
    docx = await convertFile(url, token, docx, 'import.docx', 'MathType converter');
  }
  return previewDocx(docx);
}
