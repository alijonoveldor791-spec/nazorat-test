// Namespace asosidagi cheklangan XML daraxti; DTD va tashqi entitylar rad etiladi.
import { SaxesParser } from 'saxes';
import { fail } from './http.mjs';
export const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export const MATH = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
export const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
export const MATHML = 'http://www.w3.org/1998/Math/MathML';
export function parseXml(bytes) {
  if (bytes.length > 4_000_000) fail('XML hajmi limitdan oshdi.');
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const parser = new SaxesParser({ xmlns: true });
  let root,
    count = 0;
  const stack = [];
  parser.on('doctype', () => fail('XML DTD/entity qabul qilinmaydi.'));
  parser.on('error', () => fail("XML tuzilmasi noto'g'ri."));
  parser.on('opentag', (tag) => {
    if (++count > 60000 || stack.length > 60) fail('XML tuzilmasi limitdan oshdi.');
    const node = { name: tag.local, uri: tag.uri, attrs: Object.values(tag.attributes), children: [] };
    if (stack.length) stack.at(-1).children.push(node);
    else root = node;
    stack.push(node);
  });
  const text = (value) => {
    if (stack.length) stack.at(-1).children.push(value);
  };
  parser.on('text', text);
  parser.on('cdata', text);
  parser.on('closetag', () => stack.pop());
  parser.write(source).close();
  if (!root) fail('XML manbasi bosh.');
  return root;
}
export const elements = (node) => node?.children?.filter((n) => typeof n !== 'string') || [];
export const child = (node, name, uri = node?.uri) =>
  elements(node).find((n) => n.name === name && n.uri === uri);
export const attr = (node, name, uri) =>
  node?.attrs.find((a) => a.local === name && (uri === undefined || a.uri === uri))?.value;
export const allText = (node) =>
  typeof node === 'string' ? node : (node?.children || []).map(allText).join('');
export const escapeXml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]
  );
