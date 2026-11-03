// Tekshirilgan Word contentini DOM bilan ko'rsatadi; raw HTML ishlatilmaydi.
import { esc } from '../core/dom.js';
const NS = 'http://www.w3.org/1998/Math/MathML';
const TAGS = new Set(
  'math mrow mi mn mo mtext mfrac msup msub msubsup msqrt mroot mtable mtr mtd munder mover munderover mmultiscripts mprescripts menclose mspace'.split(
    ' '
  )
);
const ATTRS = {
  display: ['block', 'inline'],
  accent: ['true', 'false'],
  largeop: ['true', 'false'],
  notation: ['box'],
  stretchy: ['true', 'false'],
};
export function contentHtml(content, images = {}) {
  let count = 0;
  function math(source) {
    if (typeof source !== 'string' || source.length > 30000 || /<!DOCTYPE|<!ENTITY/i.test(source))
      throw Error();
    const root = new DOMParser().parseFromString(source, 'application/xml').documentElement;
    if (root.localName !== 'math' || root.namespaceURI !== NS) throw Error();
    function copy(node, depth = 0) {
      if (++count > 4000 || depth > 40) throw Error();
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
      if (node.nodeType !== Node.ELEMENT_NODE || node.namespaceURI !== NS || !TAGS.has(node.localName))
        throw Error();
      const result = document.createElementNS(NS, node.localName);
      for (const a of node.attributes) {
        if (a.namespaceURI === 'http://www.w3.org/2000/xmlns/') continue;
        if (a.namespaceURI || !ATTRS[a.localName]?.includes(a.value)) throw Error();
        result.setAttribute(a.localName, a.value);
      }
      node.childNodes.forEach((child) => result.append(copy(child, depth + 1)));
      return result;
    }
    return copy(root);
  }
  function nodes(list, depth = 0) {
    if (!Array.isArray(list) || depth > 8) throw Error();
    const fragment = document.createDocumentFragment();
    for (const n of list) {
      if (++count > 4000 || !n) throw Error();
      if (n.type === 'text') {
        if (typeof n.text !== 'string' || n.text.length > 10000) throw Error();
        fragment.append(document.createTextNode(n.text));
      } else if (n.type === 'math') {
        const span = document.createElement('span');
        span.className = n.display ? 'rich-math rich-math-block' : 'rich-math';
        span.append(math(n.source));
        span.setAttribute('aria-label', String(n.alt || 'Formula').slice(0, 2000));
        fragment.append(span);
      } else if (n.type === 'image') {
        const value = images[n.assetId];
        if (
          typeof value !== 'string' ||
          value.length > 410000 ||
          !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(value)
        )
          throw Error();
        const img = document.createElement('img');
        img.src = value;
        img.alt = String(n.alt || 'Rasm').slice(0, 2000);
        img.className = 'rich-image';
        fragment.append(img);
      } else if (n.type === 'paragraph') {
        const p = document.createElement('p');
        p.append(nodes(n.children, depth + 1));
        fragment.append(p);
      } else if (n.type === 'table') {
        if (!Array.isArray(n.rows) || n.rows.length > 50) throw Error();
        const box = document.createElement('div'),
          table = document.createElement('table'),
          body = document.createElement('tbody');
        box.className = 'rich-table';
        for (const row of n.rows) {
          if (!Array.isArray(row) || row.length > 20) throw Error();
          const tr = document.createElement('tr');
          for (const cell of row) {
            const td = document.createElement('td');
            td.append(nodes(cell, depth + 1));
            tr.append(td);
          }
          body.append(tr);
        }
        table.append(body);
        box.append(table);
        fragment.append(box);
      } else throw Error();
    }
    return fragment;
  }
  try {
    if (content?.version !== 1) throw Error();
    const box = document.createElement('div');
    box.className = 'rich-content';
    box.append(nodes(content.nodes));
    return box.outerHTML;
  } catch {
    return '<span class="error">Kontentni ochib bo\'lmadi. Sahifani yangilang yoki oqituvchiga xabar bering.</span>';
  }
}
export const promptHtml = (q) => (q.rich ? contentHtml(q.rich.prompt, q.rich.images) : esc(q.q));
export const optionHtml = (q, i) =>
  q.rich ? contentHtml(q.rich.options[i], q.rich.images) : esc(q.options[i]);
