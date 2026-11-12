// Saqlangan oddiy/HTML savolni Word paragraflari, variant uslublari va jadvallarga aylantiradi.
import { richHtml } from './rich-content.mjs';
import { parseXml, children, nameOf } from './docx-xml.mjs';
import { wordRun, wordParagraph, wordTable } from './word-xml.mjs';
import { wordMath } from './word-math.mjs';
const BLOCKS = new Set(['p', 'div', 'blockquote', 'li', 'ul', 'ol', 'table']);
function properties(node, inherited) {
  const tag = nameOf(node),
    styles = (node.getAttribute('style') || '').split(';');
  let value = inherited;
  if (['strong', 'b'].includes(tag)) value += '<w:b/>';
  if (['em', 'i'].includes(tag)) value += '<w:i/>';
  if (tag === 'u') value += '<w:u w:val="single"/>';
  if (tag === 's') value += '<w:strike/>';
  if (tag === 'sub' || tag === 'sup')
    value += '<w:vertAlign w:val="' + (tag === 'sub' ? 'subscript' : 'superscript') + '"/>';
  for (const style of styles) {
    const [key, raw] = style.split(':').map((part) => part.trim());
    if (key === 'color' && /^#[0-9a-f]{6}$/i.test(raw)) value += '<w:color w:val="' + raw.slice(1) + '"/>';
    if (key === 'background-color' && /^#[0-9a-f]{6}$/i.test(raw))
      value += '<w:shd w:fill="' + raw.slice(1) + '"/>';
    if (key === 'font-size' && /^\d+(?:\.\d+)?pt$/.test(raw))
      value += '<w:sz w:val="' + Math.round(parseFloat(raw) * 2) + '"/>';
  }
  return value;
}
function inline(node, media, inherited = '') {
  if (node.nodeType === 3) return wordRun(node.nodeValue, inherited);
  if (node.nodeType !== 1) return '';
  const tag = nameOf(node);
  if (tag === 'math') return wordMath(node);
  if (tag === 'img') return media.image(node);
  if (tag === 'br') return '<w:r><w:br/></w:r>';
  const next = properties(node, inherited);
  return Array.from(node.childNodes || [])
    .map((child) => inline(child, media, next))
    .join('');
}
function htmlTable(node, media) {
  const source = children(node)
    .flatMap((child) => (nameOf(child) === 'tbody' ? children(child) : [child]))
    .filter((child) => nameOf(child) === 'tr');
  const active = [];
  const rows = source.map((row) => {
    const cells = [];
    let column = 0;
    const continuation = () => {
      while (active[column]) {
        const cell = active[column];
        cells.push({ content: wordParagraph(), span: cell.span, merge: 'continue' });
        active[column] = cell.left > 1 ? { ...cell, left: cell.left - 1 } : null;
        column += cell.span;
      }
    };
    for (const cell of children(row).filter((child) => ['td', 'th'].includes(nameOf(child)))) {
      continuation();
      const span = Number(cell.getAttribute('colspan')) || 1,
        down = Number(cell.getAttribute('rowspan')) || 1;
      cells.push({
        content: blocks(cell, media),
        span,
        merge: down > 1 ? 'restart' : '',
        header: nameOf(cell) === 'th',
      });
      if (down > 1) active[column] = { span, left: down - 1 };
      column += span;
    }
    while (column < active.length) {
      if (active[column]) continuation();
      else {
        cells.push({ content: wordParagraph() });
        column++;
      }
    }
    return cells;
  });
  return wordTable(rows);
}
function blocks(node, media) {
  const output = [];
  let buffer = '';
  const flush = () => {
    if (buffer) {
      output.push(wordParagraph(buffer));
      buffer = '';
    }
  };
  for (const child of Array.from(node.childNodes || [])) {
    const tag = nameOf(child);
    if (child.nodeType !== 1 || !BLOCKS.has(tag)) {
      buffer += inline(child, media);
      continue;
    }
    flush();
    if (tag === 'table') output.push(htmlTable(child, media));
    else if (['div', 'blockquote', 'ul', 'ol'].includes(tag)) output.push(blocks(child, media));
    else {
      const align = /text-align:\s*(left|center|right|justify)/.exec(child.getAttribute('style') || '')?.[1];
      const content = Array.from(child.childNodes || [])
        .map((part) => inline(part, media))
        .join('');
      output.push(
        wordParagraph((tag === 'li' ? wordRun('- ') : '') + content, '', align === 'justify' ? 'both' : align)
      );
    }
  }
  flush();
  return output.join('') || wordParagraph();
}
export function wordContent(value, format, media) {
  if (format !== 'rich-html-v1') return wordParagraph(wordRun(value));
  const safe = richHtml(value, 1_800_000);
  return blocks(
    parseXml(Buffer.from('<root>' + safe + '</root>'), 'Word eksport contenti').documentElement,
    media
  );
}
