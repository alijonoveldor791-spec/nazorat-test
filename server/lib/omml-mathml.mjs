// OMML ning asosiy algebra, ildiz, integral, limit va matritsa tuzilmasini MathMLga o'tkazadi.
import { children, nameOf, textOf, attr, find, serialize } from './docx-xml.mjs';
import { fail } from './http.mjs';
const NS = 'http://www.w3.org/1998/Math/MathML';
const SUPPORTED = new Set(['oMath','oMathPara','r','t','f','num','den','rad','deg','e','sSup','sSub','sSubSup','sub','sup','nary','naryPr','chr','limLow','limUpp','lim','m','mr','eqArr','d','dPr','begChr','endChr','func','fName','acc','accPr','bar','barPr','groupChr','groupChrPr','sty','rPr','ctrlPr','fPr','radPr','sSupPr','sSubPr','sSubSupPr','oMathParaPr']);
function el(doc, tag, kids = [], attrs = {}) {
  const node = doc.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  for (const child of kids) if (child) node.appendChild(child);
  return node;
}
function token(doc, tag, text, attrs = {}) {
  const node = el(doc, tag, [], attrs); node.appendChild(doc.createTextNode(text)); return node;
}
const kids = (doc, node) => children(node).filter((child) => !nameOf(child).endsWith('Pr')).flatMap((child) => convert(doc, child));
const group = (doc, node) => el(doc, 'mrow', kids(doc, node));
function convert(doc, node) {
  const tag = nameOf(node), child = (name) => find(node, name);
  if (!SUPPORTED.has(tag)) fail(`Word formulasida '${tag}' obyekti qo'llanmaydi; manba yo'qotilmasligi uchun import to'xtatildi.`);
  if (tag === 'r') {
    const raw = textOf(child('t')); if (!raw) return [];
    const style = find(child('rPr'), 'sty'), kind = /^[\p{L}]+$/u.test(raw) ? 'mi' : /^[0-9.,]+$/.test(raw) ? 'mn' : 'mtext';
    const variant = style ? ({ b: 'bold', i: 'italic', bi: 'bold-italic' }[attr(style, 'val')] || '') : '';
    return [token(doc, kind, raw, variant ? { mathvariant: variant } : {})];
  }
  if (tag === 't') return [token(doc, 'mtext', textOf(node))];
  if (tag === 'f') return [el(doc, 'mfrac', [group(doc, child('num')), group(doc, child('den'))])];
  if (tag === 'rad') return [child('deg') && textOf(child('deg')).trim()
    ? el(doc, 'mroot', [group(doc, child('e')), group(doc, child('deg'))])
    : el(doc, 'msqrt', [group(doc, child('e'))])];
  if (['sSup','sSub','sSubSup'].includes(tag)) {
    const values = [group(doc, child('e'))];
    if (tag !== 'sSup') values.push(group(doc, child('sub')));
    if (tag !== 'sSub') values.push(group(doc, child('sup')));
    return [el(doc, tag === 'sSup' ? 'msup' : tag === 'sSub' ? 'msub' : 'msubsup', values)];
  }
  if (tag === 'nary') {
    const props = child('naryPr'), op = attr(find(props, 'chr'), 'val') || '∫';
    const base = token(doc, 'mo', op), low = child('sub'), high = child('sup');
    const index = low && high ? el(doc, 'munderover', [base, group(doc, low), group(doc, high)])
      : low ? el(doc, 'munder', [base, group(doc, low)]) : high ? el(doc, 'mover', [base, group(doc, high)]) : base;
    return [el(doc, 'mrow', [index, group(doc, child('e'))])];
  }
  if (tag === 'limLow' || tag === 'limUpp') return [el(doc, tag === 'limLow' ? 'munder' : 'mover', [group(doc, child('e')), group(doc, child('lim'))])];
  if (tag === 'm') return [el(doc, 'mtable', children(node).filter((row) => nameOf(row) === 'mr').map((row) =>
    el(doc, 'mtr', children(row).filter((cell) => nameOf(cell) === 'e').map((cell) => el(doc, 'mtd', [group(doc, cell)])))))];
  if (tag === 'eqArr') return [el(doc, 'mtable', children(node).filter((row) => nameOf(row) === 'e').map((row) => el(doc, 'mtr', [el(doc, 'mtd', [group(doc, row)])])))];
  if (tag === 'd') {
    const props = child('dPr'), open = attr(find(props, 'begChr'), 'val') || '(', close = attr(find(props, 'endChr'), 'val') || ')';
    return [el(doc, 'mfenced', kids(doc, child('e')), { open, close })];
  }
  if (tag === 'func') return [el(doc, 'mrow', [...kids(doc, child('fName')), token(doc, 'mo', '⁡'), ...kids(doc, child('e'))])];
  if (['acc','bar','groupChr'].includes(tag)) {
    const props = child(`${tag}Pr`), accent = attr(find(props, 'chr'), 'val') || (tag === 'bar' ? '¯' : tag === 'groupChr' ? '⏞' : 'ˆ');
    return [el(doc, 'mover', [group(doc, child('e')), token(doc, 'mo', accent)])];
  }
  if (['oMath','oMathPara','e','num','den','sub','sup','deg','lim','fName'].includes(tag)) return kids(doc, node);
  if (tag.endsWith('Pr') || ['chr','begChr','endChr','sty','ctrlPr'].includes(tag)) return [];
  return kids(doc, node);
}
export function toMathml(node) {
  const source = serialize(node), doc = node.ownerDocument.implementation.createDocument(NS, 'math', null), root = doc.documentElement;
  const display = nameOf(node) === 'oMathPara' || nameOf(node.parentNode) === 'oMathPara';
  if (display) root.setAttribute('display', 'block');
  const semantics = el(doc, 'semantics', [el(doc, 'mrow', convert(doc, node)), el(doc, 'annotation', [], { encoding: 'application/omml+xml' })]);
  semantics.lastChild.appendChild(doc.createTextNode(source)); root.appendChild(semantics);
  return serialize(root);
}
