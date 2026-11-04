// Eski matn va server tekshirgan HTML/MathML contentni yagona xavfsiz ko'rinishga beradi.
import { esc } from './dom.js';

const HTML_TAGS = new Set(['p','div','span','strong','em','u','s','sub','sup','br','blockquote','ul','ol','li','table','tbody','tr','td','th','img']);
const MATH_TAGS = new Set(['math','semantics','annotation','mrow','mi','mn','mo','mtext','mfrac','msqrt','mroot','msup','msub','msubsup','munder','mover','munderover','mtable','mtr','mtd','mfenced']);
const IMG = /^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
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
function cloneSafe(node, target, inMath = false) {
  if (node.nodeType === Node.TEXT_NODE) return target.createTextNode(node.nodeValue);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const tag = node.localName.toLowerCase(), math = inMath || node.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
  if (!(math ? MATH_TAGS : HTML_TAGS).has(tag)) return target.createTextNode(node.textContent || '');
  const copy = target.createElementNS(math ? 'http://www.w3.org/1998/Math/MathML' : null, tag);
  for (const attribute of node.attributes) {
    if (math && ['display','encoding','mathvariant','open','close'].includes(attribute.name)) copy.setAttribute(attribute.name, attribute.value);
    if (['p','span'].includes(tag) && attribute.name === 'style') { const style = safeStyle(attribute.value); if (style) copy.setAttribute('style', style); }
    if (tag === 'img' && attribute.name === 'src' && IMG.test(attribute.value)) copy.setAttribute('src', attribute.value);
    if (tag === 'img' && attribute.name === 'alt') copy.setAttribute('alt', attribute.value.slice(0, 500));
    if (['td','th'].includes(tag) && ['rowspan','colspan'].includes(attribute.name) && /^[1-9]\d?$/.test(attribute.value)) copy.setAttribute(attribute.name, attribute.value);
  }
  if (tag === 'img' && !copy.hasAttribute('src')) return target.createTextNode(node.getAttribute('alt') || '[Rasm]');
  for (const child of node.childNodes) { const safe = cloneSafe(child, target, math); if (safe) copy.append(safe); }
  return copy;
}
export function renderContent(value, format) {
  if (format !== 'rich-html-v1') return esc(value || '');
  const parsed = new DOMParser().parseFromString(String(value || ''), 'text/html');
  const host = document.createElement('div');
  for (const child of parsed.body.childNodes) { const safe = cloneSafe(child, document, false); if (safe) host.append(safe); }
  return host.innerHTML;
}
