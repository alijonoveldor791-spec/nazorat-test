// A./B./ANSWER markerlarini strukturani yo'qotmasdan savol va variantlarga ajratadi.
import { fail } from './http.mjs';
import { validateRich } from './rich-content.mjs';
const plain = (nodes) =>
  nodes
    .map((n) =>
      n.type === 'text'
        ? n.text
        : n.type === 'math'
          ? n.alt
          : n.type === 'image'
            ? '[Rasm]'
            : n.type === 'table'
              ? '[Jadval]'
              : ''
    )
    .join('');
const content = (nodes) => ({ version: 1, nodes });
export function splitDocxQuestions(blocks, images) {
  const questions = [],
    warnings = [];
  let prompt = [],
    options = [],
    answer = null;
  function flush() {
    if (!prompt.length && !options.length) return;
    if (!prompt.length || options.length < 2 || options.length > 6)
      fail("Har savolda savol matni va 2–6 ketma-ket A.–F. variant bo'lsin.");
    const used = new Set();
    function collect(nodes) {
      for (const n of nodes) {
        if (n.type === 'image') used.add(n.assetId);
        if (n.type === 'table') n.rows.forEach((r) => r.forEach(collect));
      }
    }
    [prompt, ...options].forEach(collect);
    const rich = validateRich(
      {
        version: 1,
        prompt: content(prompt),
        options: options.map(content),
        images: Object.fromEntries([...used].map((id) => [id, images[id]])),
      },
      options.length
    );
    if (answer === null) warnings.push(`${questions.length + 1}-savolning javobini belgilang.`);
    questions.push({
      q: plain(prompt).trim().slice(0, 2000) || '[Boy savol]',
      options: options.map((n) => plain(n).trim().slice(0, 1000) || '[Boy variant]'),
      answer,
      rich,
    });
    prompt = [];
    options = [];
    answer = null;
  }
  for (const raw of blocks) {
    if (!raw.length) continue;
    const nodes = structuredClone(raw),
      text = nodes
        .filter((n) => n.type === 'text')
        .map((n) => n.text)
        .join('');
    const marker = /^(?:ANSWER|JAVOB)\s*:\s*([A-F])\s*$/i.exec(text.trim());
    if (/^(?:ANSWER|JAVOB)\s*:/i.test(text.trim()) && (!marker || !nodes.every((n) => n.type === 'text')))
      fail("Javob markeri alohida qatorda ANSWER: A shaklida bo'lsin.");
    if (marker && nodes.every((n) => n.type === 'text')) {
      if (!options.length || answer !== null) fail('Javob markeri savoldan keyin bir marta yozilsin.');
      answer = marker[1].toUpperCase().charCodeAt(0) - 65;
      if (answer >= options.length) fail('Javob varianti mavjud emas.');
      flush();
      continue;
    }
    const first = nodes.find((n) => n.type === 'text');
    if (options.length && first === nodes[0] && /^\s*\d+[.)]\s+/.test(first.text)) flush();
    const label = first && /^\s*([A-F])[.)]\s+/.exec(first.text);
    if (label && nodes[0] === first) {
      if (label[1].charCodeAt(0) - 65 !== options.length) fail("Variantlar A., B., C. tartibida bo'lsin.");
      first.text = first.text.slice(label[0].length);
      options.push(nodes);
    } else if (options.length) options.at(-1).push({ type: 'text', text: '\n' }, ...nodes);
    else prompt.push(...(prompt.length ? [{ type: 'text', text: '\n' }] : []), ...nodes);
  }
  flush();
  if (!questions.length || questions.length > 200) fail("Word faylda 1–200 savol bo'lsin.");
  if (Buffer.byteLength(JSON.stringify(questions)) > 2_000_000)
    fail('Savollar va rasmlar jami 2 MB dan oshmasin.');
  return { questions, warnings };
}
