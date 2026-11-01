// Versiyalangan content shartnomasi va eski matn uchun yo'qotishsiz adapter.
import { fail } from './http.mjs';

export const CONTENT_VERSION = 1;
const MAX_NODES = 2000;
const MAX_TEXT = 100000;
const MAX_DEPTH = 8;

function record(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail("Content obyekt bo'lishi kerak.");
}

function keys(value, allowed) {
  record(value);
  if (Object.keys(value).some((key) => !allowed.includes(key))) fail("Content ichida noma'lum maydon bor.");
}

function text(value, budget, max = 10000) {
  if (typeof value !== 'string' || value.length > max) fail("Content matni yoki uzunligi noto'g'ri.");
  budget.text += value.length;
  if (budget.text > MAX_TEXT) fail('Content matni limitdan oshdi.');
  return value;
}

function reference(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(value))
    fail("Content manba identifikatori noto'g'ri.");
  return value;
}

function nodes(value, budget, depth) {
  if (!Array.isArray(value) || value.length > MAX_NODES || depth > MAX_DEPTH)
    fail('Content tuzilmasi limitdan oshdi.');
  return value.map((node) => {
    record(node);
    if (++budget.nodes > MAX_NODES) fail('Content tugunlari limitdan oshdi.');
    if (node.type === 'text') {
      keys(node, ['type', 'text']);
      return { type: 'text', text: text(node.text, budget) };
    }
    if (node.type === 'paragraph') {
      keys(node, ['type', 'children']);
      const children = nodes(node.children, budget, depth + 1);
      if (children.some((item) => !['text', 'math', 'image', 'fallback'].includes(item.type)))
        fail("Paragraf ichidagi tugun noto'g'ri.");
      if (children.some((item) => item.type === 'math' && item.display))
        fail("Blok formula paragraf tashqarisida bo'lsin.");
      return { type: 'paragraph', children };
    }
    if (node.type === 'math') {
      keys(node, ['type', 'format', 'source', 'display', 'alt', 'sourceRef']);
      if (!['latex', 'mathml', 'omml'].includes(node.format) || typeof node.display !== 'boolean')
        fail("Formula formati yoki joylashuvi noto'g'ri.");
      const source = text(node.source, budget, 30000);
      if (!source.trim()) fail("Formula manbasi bo'sh.");
      return {
        type: 'math',
        format: node.format,
        source,
        display: node.display,
        alt: text(node.alt, budget, 2000),
        ...(node.sourceRef === undefined ? {} : { sourceRef: reference(node.sourceRef) }),
      };
    }
    if (node.type === 'image' || node.type === 'fallback') {
      keys(
        node,
        node.type === 'image'
          ? ['type', 'assetId', 'alt']
          : ['type', 'sourceRef', 'previewAssetId', 'alt', 'reason']
      );
      const alt = text(node.alt, budget, 2000);
      if (node.type === 'image') return { type: 'image', assetId: reference(node.assetId), alt };
      const reason = text(node.reason, budget, 1000);
      if (!reason.trim()) fail('Fallback sababi kerak.');
      return {
        type: 'fallback',
        sourceRef: reference(node.sourceRef),
        alt,
        reason,
        ...(node.previewAssetId === undefined ? {} : { previewAssetId: reference(node.previewAssetId) }),
      };
    }
    if (node.type === 'table') {
      keys(node, ['type', 'rows']);
      if (!Array.isArray(node.rows) || !node.rows.length || node.rows.length > 50)
        fail("Jadval qatorlari noto'g'ri.");
      let width;
      const rows = node.rows.map((row) => {
        if (!Array.isArray(row) || !row.length || row.length > 20) fail("Jadval ustunlari noto'g'ri.");
        width ??= row.length;
        if (row.length !== width) fail("Jadval to'rtburchak bo'lsin.");
        return row.map((cell) => nodes(cell, budget, depth + 1));
      });
      return { type: 'table', rows };
    }
    fail("Content tugun turi qo'llanmaydi.");
  });
}

export function validateContent(value) {
  keys(value, ['version', 'nodes']);
  if (value.version !== CONTENT_VERSION) fail("Content versiyasi qo'llanmaydi.");
  return { version: CONTENT_VERSION, nodes: nodes(value.nodes, { nodes: 0, text: 0 }, 0) };
}

export function contentFromLegacy(value) {
  if (typeof value !== 'string') fail("Eski content matn bo'lishi kerak.");
  return validateContent({ version: CONTENT_VERSION, nodes: [{ type: 'text', text: value }] });
}

export function legacyTextFromContent(value) {
  const content = validateContent(value);
  if (content.nodes.some((node) => node.type !== 'text'))
    fail("Boy contentni matnga yo'qotishsiz aylantirib bo'lmaydi.");
  return content.nodes.map((node) => node.text).join('');
}
