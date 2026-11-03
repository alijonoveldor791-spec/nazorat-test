// Boy savol contentini, MathML allowlistini va ichki raster rasmlarini tekshiradi.
import { validateContent } from './content-model.mjs';
import { createHash } from 'node:crypto';
import { parseXml, MATHML, escapeXml } from './docx-xml.mjs';
import { fail } from './http.mjs';
const MATH_TAGS = new Set(
  'math mrow mi mn mo mtext mfrac msup msub msubsup msqrt mroot mtable mtr mtd munder mover munderover mmultiscripts mprescripts menclose mspace'.split(
    ' '
  )
);
const MATH_ATTRS = {
  display: ['block', 'inline'],
  accent: ['true', 'false'],
  largeop: ['true', 'false'],
  notation: ['box'],
  stretchy: ['true', 'false'],
};
export function safeMath(source) {
  if (typeof source !== 'string' || source.length > 30000) fail('Formula hajmi limitdan oshdi.');
  const root = parseXml(Buffer.from(source));
  if (root.uri !== MATHML || root.name !== 'math') fail('MathML ildizi kerak.');
  function render(n) {
    if (typeof n === 'string') return escapeXml(n);
    if (n.uri !== MATHML || !MATH_TAGS.has(n.name)) fail("MathML elementi qo'llanmaydi.");
    const attrs = n.attrs
      .filter((a) => a.uri !== 'http://www.w3.org/2000/xmlns/')
      .map((a) => {
        if (a.uri || !MATH_ATTRS[a.local]?.includes(a.value)) fail("MathML atributi qo'llanmaydi.");
        return ` ${a.local}="${a.value}"`;
      })
      .join('');
    return `<${n.name}${n.name === 'math' ? ` xmlns="${MATHML}"` : ''}${attrs}>${n.children.map(render).join('')}</${n.name}>`;
  }
  return render(root);
}
export function imageData(buffer) {
  if (!buffer.length || buffer.length > 300000) fail('Har bir rasm 300 KB dan oshmasin.');
  let mime,
    width = 0,
    height = 0;
  if (
    buffer.length >= 33 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    buffer.toString('ascii', 12, 16) === 'IHDR'
  ) {
    mime = 'image/png';
    width = buffer.readUInt32BE(16);
    height = buffer.readUInt32BE(20);
  } else if (buffer[0] === 255 && buffer[1] === 216) {
    mime = 'image/jpeg';
    for (let offset = 2; offset + 8 < buffer.length;) {
      if (buffer[offset] !== 255) break;
      const marker = buffer[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > buffer.length) break;
      if ([0xc0, 0xc1, 0xc2].includes(marker)) {
        height = buffer.readUInt16BE(offset + 5);
        width = buffer.readUInt16BE(offset + 7);
        break;
      }
      offset += length + 2;
    }
  }
  if (!mime || !width || !height || width * height > 16_000_000)
    fail("Rasm PNG/JPEG bo'lsin; o'lchami 16 megapikseldan oshmasin.");
  return `data:${mime};base64,${buffer.toString('base64')}`;
}
export function validateRich(value, optionCount) {
  if (!value || value.version !== 1 || !Array.isArray(value.options) || value.options.length !== optionCount)
    fail("Boy savol formati noto'g'ri.");
  const images = {};
  if (
    !value.images ||
    typeof value.images !== 'object' ||
    Array.isArray(value.images) ||
    Object.keys(value.images).length > 30
  )
    fail("Rasmlar ro'yxati noto'g'ri.");
  for (const [id, data] of Object.entries(value.images)) {
    if (
      !/^[a-f0-9]{64}$/.test(id) ||
      typeof data !== 'string' ||
      !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(data)
    )
      fail("Rasm manbasi noto'g'ri.");
    const normalized = imageData(Buffer.from(data.split(',')[1], 'base64'));
    if (
      createHash('sha256')
        .update(Buffer.from(data.split(',')[1], 'base64'))
        .digest('hex') !== id
    )
      fail('Rasm identifikatori mazmunga mos emas.');
    if (data !== normalized) fail('Rasm formati mos emas.');
    images[id] = data;
  }
  const check = (raw) => {
    const content = validateContent(raw);
    function visit(nodes) {
      for (const node of nodes) {
        if (node.type === 'math') {
          if (node.format !== 'mathml' || node.sourceRef) fail('Faqat xavfsiz MathML nashr qilinadi.');
          node.source = safeMath(node.source);
        } else if (node.type === 'image') {
          if (!images[node.assetId]) fail('Savoldagi rasm topilmadi.');
        } else if (node.type === 'paragraph') visit(node.children);
        else if (node.type === 'table') node.rows.forEach((r) => r.forEach(visit));
        else if (node.type !== 'text') fail("Tekshirilmagan obyektni nashr qilib bo'lmaydi.");
      }
    }
    visit(content.nodes);
    return content;
  };
  const result = { version: 1, prompt: check(value.prompt), options: value.options.map(check), images };
  if (Buffer.byteLength(JSON.stringify(result)) > 1_500_000) fail('Boy savol hajmi limitdan oshdi.');
  return result;
}
export const questionView = (q) => ({
  q: q.q,
  options: q.options,
  ...(q.rich ? { rich: validateRich(q.rich, q.options.length) } : {}),
});
