// Word matni, formulasi, rasmi va jadvalining ketma-ketligini contentga aylantiradi.
import { createHash } from 'node:crypto';
import { WORD, MATH, REL, elements, child, attr, allText } from './docx-xml.mjs';
import { ommlMath } from './docx-math.mjs';
import { imageData } from './rich-content.mjs';
import { fail } from './http.mjs';
const DRAWING = 'http://schemas.openxmlformats.org/drawingml/2006/main';
export function docxBlocks(document, relationships, files) {
  const images = {};
  function inline(node) {
    if (
      node.uri === WORD &&
      ['sym', 'fldChar', 'instrText', 'footnoteReference', 'endnoteReference', 'txbxContent'].includes(
        node.name
      )
    )
      fail("Word belgisi, avtomatik maydon yoki izoh havolasi qo'llanmaydi. Oddiy matnga aylantiring.");
    if (
      node.uri === WORD &&
      node.name === 'rPr' &&
      elements(node).some((n) => ['vanish', 'webHidden'].includes(n.name))
    )
      fail('Yashirin matnli Word hujjati qabul qilinmaydi.');
    if (node.uri === MATH && ['oMath', 'oMathPara'].includes(node.name)) return [ommlMath(node)];
    if (node.uri === WORD && node.name === 't') return [{ type: 'text', text: allText(node) }];
    if (node.uri === WORD && ['tab', 'br', 'cr'].includes(node.name))
      return [{ type: 'text', text: node.name === 'tab' ? '\t' : '\n' }];
    if (node.uri === DRAWING && node.name === 'blip') {
      const ref = attr(node, 'embed', REL),
        target = relationships.get(ref);
      if (!target || !files.has(target)) fail("Word rasmi topilmadi yoki tashqi manbaga bog'langan.");
      const buffer = files.get(target),
        id = createHash('sha256').update(buffer).digest('hex');
      images[id] = imageData(buffer);
      return [{ type: 'image', assetId: id, alt: 'Word hujjatidagi rasm' }];
    }
    if (node.uri === WORD && ['object', 'pict', 'altChunk', 'del', 'ins', 'sdt'].includes(node.name))
      fail(
        'Wordda eski rasm, kuzatilgan tahrir yoki murakkab obyekt bor. Oddiy matn/Equation/PNG qilib saqlang.'
      );
    if (node.uri === WORD && node.name.endsWith('Pr')) return [];
    if (node.name === 'AlternateContent')
      fail("Muqobil Word obyekti qo'llanmaydi. PNG yoki Word Equation ishlating.");
    const result = elements(node).flatMap(inline);
    if (node.uri === WORD && node.name === 'drawing' && !result.length)
      fail('Word diagrammasini PNG yoki JPEG rasmga aylantiring.');
    return result;
  }
  function block(node) {
    if (node.uri !== WORD) fail("Word blok turi qo'llanmaydi.");
    if (node.name === 'p') {
      if (elements(child(node, 'pPr', WORD)).some((n) => n.name === 'numPr'))
        fail("Avtomatik raqamlashni oddiy matnga aylantiring; A./B. va ANSWER markerlari matn bo'lsin.");
      const nodes = inline(node).reduce((out, n) => {
        if (n.type === 'text' && out.at(-1)?.type === 'text') out.at(-1).text += n.text;
        else out.push(n);
        return out;
      }, []);
      // Blok formula paragraf orasida kelsa ASTning yuqori darajasida qoladi.
      return nodes;
    }
    if (node.name === 'tbl') {
      const rows = elements(node)
        .filter((n) => n.name === 'tr')
        .map((row) =>
          elements(row)
            .filter((n) => n.name === 'tc')
            .map((cell) => {
              if (
                elements(child(cell, 'tcPr', WORD)).some((n) =>
                  ['gridSpan', 'vMerge', 'hMerge'].includes(n.name)
                )
              )
                fail('Birlashtirilgan jadval kataklarini oddiy jadvalga aylantiring.');
              return elements(cell)
                .filter((n) => ['p', 'tbl'].includes(n.name))
                .flatMap((n) => [...block(n), { type: 'text', text: '\n' }]);
            })
        );
      return [{ type: 'table', rows }];
    }
    if (node.name === 'sectPr') return [];
    fail(`Word bloki qollanmaydi: ${node.name}.`);
  }
  const body = child(document, 'body', WORD);
  if (document.uri !== WORD || document.name !== 'document' || !body) fail('Word document.xml topilmadi.');
  return { blocks: elements(body).map((node) => block(node)), images };
}
