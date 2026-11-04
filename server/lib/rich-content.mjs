// Import qilingan markupni cheklangan HTML/MathML allowlistiga moslab qayta quradi.
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { fail } from './http.mjs';
const MATH_NS = 'http://www.w3.org/1998/Math/MathML';
const HTML_TAGS = new Set(['p','div','span','strong','em','u','s','sub','sup','br','blockquote','ul','ol','li','table','tbody','tr','td','th','img']);
const MATH_TAGS = new Set(['math','semantics','annotation','mrow','mi','mn','mo','mtext','mfrac','msqrt','mroot','msup','msub','msubsup','munder','mover','munderover','mtable','mtr','mtd','mfenced']);
function imageSource(value) { return /^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= 1_500_000; }
function safeStyle(value) {
  return value.split(';').flatMap((part) => {
    const [key, raw] = part.split(':').map((item) => item.trim());
    const valid = key === 'color' || key === 'background-color' ? /^#[0-9a-f]{6}$/i.test(raw || '')
      : key === 'font-size' ? /^(?:[1-9]\d?(?:\.\d+)?|100)pt$/.test(raw || '')
        : key === 'font-family' ? /^[A-Za-z0-9 -]{1,60}$/.test(raw || '')
          : key === 'text-align' ? ['left','center','right','justify'].includes(raw) : false;
    return valid ? [`${key}:${raw}`] : [];
  }).join(';');
}
function copy(node, doc, budget, insideMath = false) {
  if (node.nodeType === 3) return doc.createTextNode(node.nodeValue);
  if (node.nodeType !== 1) return null;
  if (++budget.nodes > 3000) fail('Boy content tugunlari limitdan oshdi.');
  const tag = node.localName || node.nodeName.toLowerCase(), math = insideMath || tag === 'math' || node.namespaceURI === MATH_NS;
  if (!(math ? MATH_TAGS : HTML_TAGS).has(tag)) fail(`Boy contentda qo'llanmaydigan '${tag}' elementi bor.`);
  const output = doc.createElementNS(math ? MATH_NS : null, tag);
  for (const item of Array.from(node.attributes || [])) {
    const name = item.localName || item.name;
    if (name === 'xmlns' && item.value === MATH_NS) output.setAttribute('xmlns', MATH_NS);
    else if (math && ['display','encoding','mathvariant','open','close'].includes(name)) output.setAttribute(name, item.value);
    else if (['p','span'].includes(tag) && name === 'style') { const style = safeStyle(item.value); if (style) output.setAttribute('style', style); }
    else if (tag === 'img' && name === 'src' && imageSource(item.value)) output.setAttribute('src', item.value);
    else if (tag === 'img' && name === 'alt') output.setAttribute('alt', item.value.slice(0, 500));
    else if (['td','th'].includes(tag) && ['rowspan','colspan'].includes(name) && /^[1-9]\d?$/.test(item.value)) output.setAttribute(name, item.value);
  }
  if (tag === 'img' && !output.getAttribute('src')) fail("Rasm manbasi xavfsiz yoki to'liq emas.");
  for (const child of Array.from(node.childNodes || [])) {
    const result = copy(child, doc, budget, math); if (result) output.appendChild(result);
  }
  return output;
}
export function richHtml(value, max = 300_000) {
  if (typeof value !== 'string' || value.length > max) fail('Boy content uzunligi limitdan oshdi.');
  if (/<!DOCTYPE|<!ENTITY|<\?xml|<script|<style|<svg|<iframe|<object|<embed/i.test(value)) fail('Boy content ichida faol yoki tashqi element bor.');
  const errors = [], parser = new DOMParser({ onError: (level, message) => errors.push(`${level}:${message}`) });
  const fragment = parser.parseFromString(`<root>${value}</root>`, 'application/xml');
  if (errors.length || !fragment.documentElement) fail("Boy content XML fragmenti noto'g'ri.");
  const doc = fragment.implementation.createDocument(null, 'root', null), root = doc.documentElement;
  const budget = { nodes: 0 };
  for (const child of Array.from(fragment.documentElement.childNodes)) {
    const result = copy(child, doc, budget); if (result) root.appendChild(result);
  }
  return Array.from(root.childNodes).map((node) => new XMLSerializer().serializeToString(node)).join('');
}
