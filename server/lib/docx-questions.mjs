// Word bloklaridan bo'limlar va tekshirilgan savollarni ajratadi.
import { parseXml, children, serialize } from './docx-xml.mjs';
import { richHtml } from './rich-content.mjs';
import { fail } from './http.mjs';
function stripPrefix(html, prefix) {
  const doc = parseXml(Buffer.from(`<root>${html}</root>`), 'Savol previewi'),
    root = doc.documentElement;
  let left = prefix.length;
  const visit = (node) => {
    if (node.nodeType === 3 && left) {
      const count = Math.min(left, node.nodeValue.length);
      node.nodeValue = node.nodeValue.slice(count);
      left -= count;
    }
    for (const child of Array.from(node.childNodes || [])) visit(child);
  };
  visit(root);
  if (left) fail('Variant boshidagi belgi markupdan ajratilmadi.');
  return children(root).map(serialize).join('');
}
export function makeQuestions(blocks) {
  const questions = [];
  let current = null,
    section = null;
  const problem = (message) => fail(`${questions.length + 1}-savol: ${message}`);
  const finish = () => {
    if (!current) return;
    if (!current.q.trim() || current.options.length < 2 || current.options.length > 6)
      problem("Har savolda matn va 2–6 ta variant bo'lsin.");
    const marked = current.options.filter((option) => option.correct);
    if (marked.length !== 1)
      problem("Har savolda aynan bitta variant boshida #B. yoki # B. belgisi bo'lsin.");
    questions.push({
      ...(section ? { section: { ...section } } : {}),
      contentFormat: 'rich-html-v1',
      q: richHtml(current.q),
      options: current.options.map((o) => richHtml(o.html)),
      answer: current.options.indexOf(marked[0]),
    });
  };
  for (const block of blocks) {
    const text = block.text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (text.startsWith('##')) {
      finish();
      current = null;
      const heading = /^##\s*(.+?)\s*##\s*(.+)$/.exec(text);
      if (!heading) problem("Bo'lim sarlavhasi: ##bo'lim turi ##Fan nomi shaklida bo'lsin.");
      section = {
        id: `section-${questions.length + 1}`,
        type: heading[1].trim(),
        subject: heading[2].trim(),
      };
      continue;
    }
    const numbered = /^\d{1,3}[.)]\s+/.exec(text);
    if ((numbered || block.numbered) && current?.options.length) {
      finish();
      current = null;
    }
    if (!current) current = { q: '', options: [] };
    if (numbered || block.numbered) {
      current.q += stripPrefix(block.html, numbered?.[0] || '• ');
      continue;
    }
    const marked = /^\s*#\s*([A-F])[.)]\s*/i.exec(text),
      option = /^\s*([A-F])[.)]\s*/i.exec(text);
    if (marked || option) {
      if (!current.q.trim()) problem("Variantlardan oldin savol matni bo'lsin.");
      const match = marked || option,
        letter = match[1].toUpperCase();
      if (letter.charCodeAt(0) - 65 !== current.options.length)
        problem("Variant harflari A dan boshlab ketma-ket bo'lsin.");
      current.options.push({ html: stripPrefix(block.html, match[0]), correct: !!marked });
    } else if (current.options.length) current.options.at(-1).html += block.html;
    else current.q += block.html;
  }
  finish();
  if (!questions.length || questions.length > 200) problem("Word faylidan 1–200 ta to'liq savol topilmadi.");
  return questions;
}
