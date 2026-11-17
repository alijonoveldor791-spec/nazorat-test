// Bitta saqlangan test tartibidan kalitsiz DOCX va xavfsiz A4 chop nusxasini yaratadi.
import { wordText } from './word-xml.mjs';
import { labeledWord, wordOptionPairs } from './test-document-layout.mjs';
import { richHtml } from './rich-content.mjs';
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
      body += labeledWord(q.q, q.contentFormat, media, `${i + 1}.`, true);
      body += wordOptionPairs(q, media);
    });
  }
  return wordPackage(body, media);
}
export function testPrint(test) {
  const content = (q, text) =>
    q.contentFormat === 'rich-html-v1' ? richHtml(text, 1_800_000) : escape(text);
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>${escape(test.title)}</title>
    <link rel="stylesheet" href="/css/pages/test-print.css"><script type="module" src="/js/teacher/test-print.js"></script></head>
    <body><button id="print">PDF saqlash / Chop etish</button><h1>${escape(test.title)}</h1>
    <p>Ism-familiya: ____________________ Sinf: ______ Sana: __________</p>
    ${test.questions
      .map(
        (q, i) =>
          `<section><div class="question"><b class="question-number">${i + 1}.</b><div class="question-content">${content(q, q.q)}</div></div><div class="options">${q.options
            .map(
              (o, j) =>
                `<div class="option"><b class="option-label">${String.fromCharCode(65 + j)}.</b><div class="option-content">${content(q, o)}</div></div>`
            )
            .join('')}</div></section>`
      )
      .join('')}</body></html>`;
}
