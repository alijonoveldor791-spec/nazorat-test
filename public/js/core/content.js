// Rich HTML'ni tozalaydi va formulalarni mahalliy MathJax bilan tasvirlaydi.
import { el } from './dom.js';
const HTML_TAGS = new Set([
  'p',
  'div',
  'span',
  'strong',
  'em',
  'u',
  's',
  'sub',
  'sup',
  'br',
  'blockquote',
  'ul',
  'ol',
  'li',
  'table',
  'tbody',
  'tr',
  'td',
  'th',
  'img',
]);
const MATH_TAGS = new Set([
  'math',
  'semantics',
  'annotation',
  'mrow',
  'mi',
  'mn',
  'mo',
  'mtext',
  'mfrac',
  'msqrt',
  'mroot',
  'msup',
  'msub',
  'msubsup',
  'munder',
  'mover',
  'munderover',
  'mtable',
  'mtr',
  'mtd',
  'mfenced',
]);
const IMG_REGEX = /^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
function safeStyle(value) {
  return value
    .split(';')
    .flatMap((part) => {
      const [key, raw] = part.split(':').map((item) => item.trim());
      const valid =
        key === 'color' || key === 'background-color'
          ? /^#[0-9a-f]{6}$/i.test(raw || '')
          : key === 'font-size'
            ? /^(?:[1-9]\d?(?:\.\d+)?|100)pt$/.test(raw || '')
            : key === 'font-family'
              ? /^[A-Za-z0-9 -]{1,60}$/.test(raw || '')
              : key === 'text-align'
                ? ['left', 'center', 'right', 'justify'].includes(raw)
                : false;
      return valid ? [`${key}:${raw}`] : [];
    })
    .join(';');
}
function cloneSafe(node, target, inMath = false) {
  if (node.nodeType === Node.TEXT_NODE) return target.createTextNode(node.nodeValue || '');
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node;
  const tag = el.localName.toLowerCase();
  const math = inMath || el.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
  if (!(math ? MATH_TAGS : HTML_TAGS).has(tag)) return target.createTextNode(el.textContent || '');
  const copy = target.createElementNS(math ? 'http://www.w3.org/1998/Math/MathML' : null, tag);
  for (const attr of Array.from(el.attributes)) {
    if (math && ['display', 'encoding', 'mathvariant', 'open', 'close'].includes(attr.name)) {
      copy.setAttribute(attr.name, attr.value);
    }
    if (['p', 'span'].includes(tag) && attr.name === 'style') {
      const style = safeStyle(attr.value);
      if (style) copy.setAttribute('style', style);
    }
    if (tag === 'img' && attr.name === 'src' && IMG_REGEX.test(attr.value)) {
      copy.setAttribute('src', attr.value);
    }
    if (tag === 'img' && attr.name === 'alt') {
      copy.setAttribute('alt', attr.value.slice(0, 500));
    }
    if (
      tag === 'img' &&
      ['width', 'height'].includes(attr.name) &&
      /^(?:[1-9]\d{0,2}|1[0-5]\d{2}|1600)$/.test(attr.value)
    ) {
      copy.setAttribute(attr.name, attr.value);
    }
    if (
      ['td', 'th'].includes(tag) &&
      ['rowspan', 'colspan'].includes(attr.name) &&
      /^[1-9]\d?$/.test(attr.value)
    ) {
      copy.setAttribute(attr.name, attr.value);
    }
  }
  if (tag === 'img' && !copy.hasAttribute('src')) {
    return target.createTextNode(el.getAttribute('alt') || '[Rasm]');
  }
  for (const child of Array.from(el.childNodes)) {
    const safe = cloneSafe(child, target, math);
    if (safe) copy.append(safe);
  }
  return copy;
}
export function sanitizeRichHtml(value, format) {
  if (format !== 'rich-html-v1') return '';
  const parsed = new DOMParser().parseFromString(String(value || ''), 'text/html');
  const host = document.createElement('div');
  for (const child of Array.from(parsed.body.childNodes)) {
    const safe = cloneSafe(child, document, false);
    if (safe) host.append(safe);
  }
  return host.innerHTML;
}
export function stripHtml(value) {
  const parsed = new DOMParser().parseFromString(String(value || ''), 'text/html');
  return parsed.body.textContent || '';
}
let mathReady = null;
let mathPending = Promise.resolve();
export function renderMathInElement(root) {
  if (!root || !root.querySelector('math')) return;
  if (!mathReady) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/vendor/mathjax/svg.css';
    const stylesReady = new Promise((resolve, reject) => {
      stylesheet.onload = () => resolve();
      stylesheet.onerror = () => reject(new Error('Formula uslublari yuklanmadi.'));
      document.head.append(stylesheet);
    });
    window.MathJax = {
      loader: {
        paths: { fonts: '/vendor/mathjax/fonts' },
        load: ['input/mml', 'output/svg'],
      },
      startup: {
        typeset: false,
        ready() {
          window.MathJax?.startup?.defaultReady?.();
          if (window.MathJax?.startup?.output) {
            window.MathJax.startup.output.styleSheet = () => stylesheet;
          }
        },
      },
    };
    const scriptReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/vendor/mathjax/startup.js';
      script.onload = () => {
        const p = window.MathJax?.startup?.promise;
        if (p) p.then(() => resolve(), reject);
        else resolve();
      };
      script.onerror = () => reject(new Error('Lokal MathJax yuklanmadi.'));
      document.head.append(script);
    });
    mathReady = Promise.all([scriptReady, stylesReady]);
  }
  mathPending = mathPending
    .then(() => mathReady)
    .then(() => {
      if (root.isConnected && root.querySelector('math')) {
        const mathList = window.MathJax?.startup?.document?.math || [];
        const detached = Array.from(mathList)
          .map((item) => item.typesetRoot)
          .filter((node) => Boolean(node && !node.isConnected));
        if (detached.length) window.MathJax?.typesetClear?.(detached);
        return window.MathJax?.typesetPromise?.([root]);
      }
    })
    .catch((err) => console.error(err));
  return mathPending;
}
