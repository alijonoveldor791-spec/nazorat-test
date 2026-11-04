// OOXML qismlarini entity va tashqi resurslarsiz tahlil qiladi.
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { fail } from './http.mjs';

export function parseXml(bytes, label) {
  const started = Date.now();
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (source.length > 8_000_000 || /<!DOCTYPE|<!ENTITY|<\?xml-stylesheet|<!\[CDATA\[/i.test(source))
    fail(`${label}: DTD, entity yoki tashqi stylesheet rad etildi.`);
  const errors = [];
  const document = new DOMParser({ onError: (level, message) => errors.push(`${level}:${message}`) })
    .parseFromString(source, 'application/xml');
  if (errors.length || !document.documentElement || document.getElementsByTagName('parsererror').length)
    fail(`${label}: XML tuzilmasi noto'g'ri.`);
  const pending = [[document.documentElement, 1]]; let count = 0;
  while (pending.length) {
    const [node, depth] = pending.pop();
    if (++count > 100_000 || depth > 64) fail(`${label}: XML obyekt yoki chuqurlik limiti oshdi.`);
    for (const child of children(node)) pending.push([child, depth + 1]);
  }
  if (Date.now() - started > 5000) fail(`${label}: XML tahlili 5 soniyadan oshdi.`);
  return document;
}
export const children = (node) => Array.from(node?.childNodes || []).filter((child) => child.nodeType === 1);
export const nameOf = (node) => node?.localName || node?.nodeName?.split(':').at(-1) || '';
export const textOf = (node) => Array.from(node?.childNodes || []).map((child) =>
  child.nodeType === 3 || child.nodeType === 4 ? child.nodeValue : textOf(child)).join('');
export function attr(node, localName) {
  return Array.from(node?.attributes || []).find((item) => item.localName === localName || item.name.endsWith(':' + localName))?.value || '';
}
export const serialize = (node) => new XMLSerializer().serializeToString(node);
export const find = (node, localName) => children(node).find((child) => nameOf(child) === localName);
