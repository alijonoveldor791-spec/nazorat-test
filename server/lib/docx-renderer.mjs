// Word formulalari, rasmlari va jadvallarini boy HTMLga aylantiradi.
import { posix as path } from 'node:path';
import { children, nameOf, textOf, attr, find } from './docx-xml.mjs';
import { toMathml } from './omml-mathml.mjs';
import { fail } from './http.mjs';
import { parsePart } from './docx-part.mjs';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export function relationships(files, names) {
  const file = 'word/_rels/document.xml.rels',
    doc = parsePart(files, file),
    result = new Map();
  for (const rel of doc?.getElementsByTagName('Relationship') || []) {
    if (rel.getAttribute('TargetMode') === 'External')
      fail("DOCX tashqi resursga havola qiladi; import xavfsizlik uchun to'xtatildi.");
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
  const ext = target.split('.').at(-1).toLowerCase(),
    mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' }[
      ext
    ];
  const data = files[target];
  if (!mime || !data)
    fail("Rasm faqat PNG, JPEG, GIF yoki WEBP bo'lsin; SVG va tashqi rasm qabul qilinmaydi.");
  const bytes = Buffer.from(data),
    valid =
      mime === 'image/png'
        ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : mime === 'image/jpeg'
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : mime === 'image/gif'
            ? ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString())
            : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (!valid) fail('DOCX ichidagi rasm buzilgan yoki MIME turi mos emas.');
  budget.media += data.length;
  if (++budget.images > 20 || budget.media > 1_000_000)
    fail('Rasm soni yoki umumiy media hajmi import limitidan oshdi.');
  const alt = node.getElementsByTagNameNS('*', 'docPr')[0]?.getAttribute('descr') || '';
  return {
    html: `<img src="data:${mime};base64,${Buffer.from(data).toString('base64')}" alt="${esc(alt)}"/>`,
    text: alt || '[Rasm]',
  };
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
  if (
    [
      'bookmarkStart',
      'bookmarkEnd',
      'commentRangeStart',
      'commentRangeEnd',
      'proofErr',
      'pPr',
      'rPr',
    ].includes(tag)
  )
    return { html: '', text: '' };
  if (
    ['hyperlink', 'sdt', 'sdtContent', 'smartTag', 'customXml', 'ins', 'del', 'moveFrom', 'moveTo'].includes(
      tag
    )
  ) {
    const items = children(node).map((child) => inline(child, budget));
    return { html: items.map((item) => item.html).join(''), text: items.map((item) => item.text).join('') };
  }
  if (textOf(node).trim()) fail(`Word '${tag}' elementi tarkibni yo'qotishi mumkin; import to'xtatildi.`);
  return { html: '', text: '' };
}
function runHtml(run, budget) {
  const props = find(run, 'rPr'),
    values = [];
  for (const child of children(run)) {
    const tag = nameOf(child);
    if (tag === 'rPr') continue;
    if (tag === 't') values.push(esc(textOf(child)).replaceAll('\n', '<br/>').replaceAll('\t', '&#9;'));
    else if (tag === 'tab') values.push('&#9;');
    else if (tag === 'br' || tag === 'cr') values.push('<br/>');
    else if (tag === 'drawing') values.push(mediaFor(child, budget.rels, budget.files, budget));
    else if (tag === 'object' || tag === 'pict')
      fail(
        "MathType/OLE yoki VML obyekt aniqlandi. Uni MathMLga o'girish uchun MATHTYPE_CONVERTER_URL xizmati kerak."
      );
    else if (tag === 'oMath' || tag === 'oMathPara')
      values.push({ html: toMathml(child), text: textOf(child) });
  }
  let html = values.map((part) => (typeof part === 'string' ? part : part.html)).join('');
  const text = values
    .map((part) => (typeof part === 'string' ? part.replace(/<[^>]*>/g, '') : part.text))
    .join('');
  const wrapping = [
    ['b', 'strong'],
    ['i', 'em'],
    ['u', 'u'],
    ['strike', 's'],
  ];
  for (const [prop, tag] of wrapping) {
    const value = find(props, prop);
    if (
      value &&
      attr(value, 'val') !== '0' &&
      attr(value, 'val') !== 'none' &&
      attr(value, 'val') !== 'false'
    )
      html = `<${tag}>${html}</${tag}>`;
  }
  const vertical = attr(find(props, 'vertAlign'), 'val');
  if (vertical === 'superscript' || vertical === 'subscript')
    html = `<${vertical === 'superscript' ? 'sup' : 'sub'}>${html}</${vertical === 'superscript' ? 'sup' : 'sub'}>`;
  const style = [],
    color = attr(find(props, 'color'), 'val'),
    highlight = attr(find(props, 'highlight'), 'val');
  const size = Number(attr(find(props, 'sz'), 'val')) / 2,
    font = attr(find(props, 'rFonts'), 'ascii');
  if (/^[0-9a-f]{6}$/i.test(color)) style.push(`color:#${color}`);
  const highlights = {
    yellow: '#ffff00',
    green: '#00ff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    blue: '#0000ff',
    red: '#ff0000',
    darkBlue: '#00008b',
    darkRed: '#8b0000',
    darkGreen: '#006400',
    darkGray: '#a9a9a9',
    lightGray: '#d3d3d3',
    black: '#000000',
    white: '#ffffff',
  };
  if (highlights[highlight]) style.push(`background-color:${highlights[highlight]}`);
  if (Number.isFinite(size) && size >= 1 && size <= 100) style.push(`font-size:${size}pt`);
  if (/^[A-Za-z0-9 -]{1,60}$/.test(font)) style.push(`font-family:${font}`);
  if (style.length) html = `<span style="${style.join(';')}">${html}</span>`;
  return { html, text };
}
export function renderNode(node, budget) {
  const tag = nameOf(node);
  if (tag === 'p') {
    const contents = children(node).map((child) => inline(child, budget));
    const text = contents.map((item) => item.text).join('');
    const align = attr(find(find(node, 'pPr'), 'jc'), 'val');
    const style = ['center', 'right', 'left', 'both'].includes(align)
      ? ` style="text-align:${align === 'both' ? 'justify' : align}"`
      : '';
    const numbered = !!find(find(node, 'pPr'), 'numPr');
    const listMark = numbered ? '• ' : '';
    return {
      html: `<p${style}>${listMark}${contents.map((item) => item.html).join('')}</p>`,
      text: listMark + text,
      numbered,
    };
  }
  if (tag === 'tbl') {
    const rows = children(node)
      .filter((row) => nameOf(row) === 'tr')
      .map((row) =>
        children(row)
          .filter((cell) => nameOf(cell) === 'tc')
          .map((cell) => {
            const items = children(cell).map((part) => renderNode(part, budget));
            return {
              html: `<td>${items.map((item) => item.html).join('')}</td>`,
              text: items.map((item) => item.text).join(' '),
            };
          })
      );
    return {
      html: `<table><tbody>${rows.map((row) => `<tr>${row.map((cell) => cell.html).join('')}</tr>`).join('')}</tbody></table>`,
      text: rows.map((row) => row.map((cell) => cell.text).join(' ')).join(' '),
    };
  }
  return { html: '', text: '' };
}

export function documentBlocks(body, budget) {
  let number = 0;
  return children(body)
    .map((node) => {
      if (
        nameOf(node) === 'p' &&
        (/^\s*\d{1,3}[.)]\s+/.test(textOf(node)) || find(find(node, 'pPr'), 'numPr'))
      )
        number++;
      try {
        return renderNode(node, budget);
      } catch (error) {
        fail(`${number || 1}-savol: ${error.message}`, error.status || 400);
      }
    })
    .filter((item) => item.text.trim());
}
