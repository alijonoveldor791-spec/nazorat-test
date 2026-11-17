// Bitta saqlangan test tartibidan kalitsiz DOCX va xavfsiz A4 chop nusxasini yaratadi.
import { wordText } from './word-xml.mjs';
import { wordContent } from './word-rich.mjs';
import { createWordMedia } from './word-media.mjs';
import { wordPackage } from './word-package.mjs';
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
export function testDocx(test, key = false) {
  const media = createWordMedia();
  let body = wordText(test.title, 'Title');
  if (key)
    body += test.questions
      .map((q, i) => wordText(`${i + 1}. ${String.fromCharCode(65 + q.answer)}`))
      .join('');
  else {
    body += wordText('Ism-familiya: ____________________ Sinf: ______ Sana: __________');
    test.questions.forEach((q, i) => {
      body += wordText(`${i + 1}.`, 'Heading2') + wordContent(q.q, q.contentFormat, media);
      q.options.forEach((o, j) => {
        body += wordText(String.fromCharCode(65 + j) + '.') + wordContent(o, q.contentFormat, media);
      });
    });
  }
  return wordPackage(body, media);
}
export function testPrint(test) {
  const content = (q, text) => (q.contentFormat === 'rich-html-v1' ? text : escape(text));
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>${escape(test.title)}</title>
    <link rel="stylesheet" href="/css/pages/test-print.css"><script type="module" src="/js/teacher/test-print.js"></script></head>
    <body><button id="print">PDF saqlash / Chop etish</button><h1>${escape(test.title)}</h1>
    <p>Ism-familiya: ____________________ Sinf: ______ Sana: __________</p>
    ${test.questions
      .map(
        (q, i) =>
          `<section><h2>${i + 1}.</h2>${content(q, q.q)}${q.options
            .map((o, j) => `<div class="option"><b>${String.fromCharCode(65 + j)}.</b>${content(q, o)}</div>`)
            .join('')}</section>`
      )
      .join('')}</body></html>`;
}
