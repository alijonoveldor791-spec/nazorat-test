// DOCXni tuzilmasi bilan o'qib, boy savol/variant va to'g'ri javob previewini tuzadi.
import { openDocx } from '../lib/docx-archive.mjs';
import { parsePart } from '../lib/docx-part.mjs';
import { relationships, documentBlocks } from '../lib/docx-renderer.mjs';
import { makeQuestions } from '../lib/docx-questions.mjs';
import { fail } from '../lib/http.mjs';
import { env } from '../lib/env.mjs';
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

export function previewDocx(input) {
  const { names, files } = openDocx(input),
    budget = { files, names, rels: null, media: 0, images: 0 };
  parsePart(files, '[Content_Types].xml');
  if (/macroEnabled|vbaProject/i.test(Buffer.from(files['[Content_Types].xml']).toString('utf8')))
    fail('Makrosiz DOCX faylni tanlang.');
  if ([...names].some((name) => name.startsWith('word/embeddings/')))
    fail(
      'MathType/OLE formulani DOC_MATH_CONVERTER_URL xizmati OMML/MathML manbasini saqlab aylantirmaguncha fayl saqlanmadi.'
    );
  for (const name of names)
    if (name.endsWith('.rels')) {
      const relDoc = parsePart(files, name);
      if (
        [...(relDoc?.getElementsByTagName('Relationship') || [])].some(
          (rel) => rel.getAttribute('TargetMode') === 'External'
        )
      )
        fail("DOCX tashqi resurs havolasini o'z ichiga oladi; xavfsizlik uchun import to'xtatildi.");
    }
  budget.rels = relationships(files, names);
  const doc = parsePart(files, 'word/document.xml'),
    body = doc.getElementsByTagNameNS(W, 'body')[0];
  if (!body) fail('DOCX hujjat tanasi topilmadi.');
  if (
    ['headerReference', 'footerReference', 'footnoteReference', 'endnoteReference', 'commentReference'].some(
      (tag) => doc.getElementsByTagNameNS(W, tag).length
    )
  )
    fail(
      "DOCX header/footer, izoh yoki footnote contentiga ega. Yo'qolishni oldini olish uchun ularni hujjat tanasiga ko'chiring."
    );
  const blocks = documentBlocks(body, budget);
  const questions = makeQuestions(blocks);
  return {
    questions,
    sections: [...new Map(questions.filter((q) => q.section).map((q) => [q.section.id, q.section])).values()],
    warnings: [],
    status: 'complete',
  };
}

async function convertFile(urlValue, token, file, name, operation) {
  let url;
  try {
    url = new URL(urlValue);
  } catch {
    fail(`${operation}: Netlify muhitida converter URL noto'g'ri.`, 503);
  }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname) && env('NETLIFY_DEV') === 'true';
  if (url.protocol !== 'https:' && !local) fail(`${operation}: HTTPS manzili kerak.`, 503);
  const body = new FormData();
  body.append('file', new Blob([file]), name);
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body,
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    fail(
      `${operation} xizmatiga ulanib bo'lmadi. Netlify Site configuration → Environment variables ichida URL va tokenni tekshiring.`,
      503
    );
  }
  if (!response.ok)
    fail(`${operation} xizmati ${response.status} xato qaytardi. Xizmat loglarini tekshiring.`, 502);
  if (!response.headers.get('content-type')?.includes('wordprocessingml.document'))
    fail(`${operation} xizmati haqiqiy DOCX qaytarmadi.`, 502);
  const reader = response.body?.getReader(),
    chunks = [];
  let size = 0;
  if (reader)
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4_000_000) {
        await reader.cancel();
        fail('Converter natijasi 4 MB dan oshdi.', 413);
      }
      chunks.push(Buffer.from(value));
    }
  return Buffer.concat(chunks);
}

export async function previewWordFile(file, filename) {
  const extension = filename.toLowerCase().split('.').at(-1);
  let docx = file;
  if (extension === 'doc') {
    const url = env('DOC_CONVERTER_URL'),
      token = env('DOC_CONVERTER_TOKEN');
    if (!url || !token)
      fail(
        'Eski .doc uchun DOC_CONVERTER_URL va DOC_CONVERTER_TOKEN Netlify environment variables sifatida sozlansin. DOCX fayl converter talab qilmaydi.',
        503
      );
    docx = await convertFile(url, token, file, filename, 'DOC konvertori');
  } else if (extension !== 'docx') fail('Faqat haqiqiy .doc yoki .docx Word fayl qabul qilinadi.');
  const archive = openDocx(docx);
  if ([...archive.names].some((name) => name.startsWith('word/embeddings/'))) {
    const url = env('DOC_MATH_CONVERTER_URL'),
      token = env('DOC_MATH_CONVERTER_TOKEN');
    if (!url || !token)
      fail(
        'MathType/OLE formulalari uchun DOC_MATH_CONVERTER_URL va DOC_MATH_CONVERTER_TOKEN kerak; Netlify environment variables sozlang.',
        503
      );
    docx = await convertFile(url, token, docx, 'import.docx', 'MathType converter');
  }
  return previewDocx(docx);
}
