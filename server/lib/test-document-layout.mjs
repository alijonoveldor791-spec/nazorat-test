// Chop testida raqamlarni birinchi paragrafga va variantlarni ikki ustunga joylaydi.
import { wordRun, wordParagraph } from './word-xml.mjs';
import { wordContent } from './word-rich.mjs';
export function labeledWord(value, format, media, label, keepNext = false) {
  let content = wordContent(value, format, media);
  if (keepNext)
    content = content.replace(
      /<w:r>(<w:rPr>[\s\S]*?<\/w:rPr>)?/g,
      (_, properties) =>
        '<w:r>' +
        (properties
          ? /<w:b\b/.test(properties)
            ? properties
            : properties.replace('</w:rPr>', '<w:b/></w:rPr>')
          : '<w:rPr><w:b/></w:rPr>')
    );
  const prefix = wordRun(label + ' ', '<w:b/>');
  if (!content.startsWith('<w:p>')) return wordParagraph(prefix) + content;
  return content.replace(/^<w:p>(<w:pPr>[\s\S]*?<\/w:pPr>)?/, (_, properties) => {
    const spacing = '<w:spacing w:before="0" w:after="60"/>' + (keepNext ? '<w:keepNext/>' : '');
    const props = properties
      ? properties.replace('</w:pPr>', spacing + '</w:pPr>')
      : '<w:pPr>' + spacing + '</w:pPr>';
    return '<w:p>' + props + prefix;
  });
}
function fitOptionContent(content) {
  return content
    .replace(/<(wp:extent|a:ext) cx="(\d+)" cy="(\d+)"/g, (_, tag, width, height) => {
      const scale = Math.min(1, 2768600 / Number(width));
      return `<${tag} cx="${Math.round(Number(width) * scale)}" cy="${Math.round(Number(height) * scale)}"`;
    })
    .replace(
      /<w:(tblW|tcW|gridCol) w:w="(\d+)"/g,
      (_, tag, width) => `<w:${tag} w:w="${Math.floor((Number(width) * 4360) / 9000)}"`
    );
}
export function wordOptionPairs(question, media) {
  const cells = question.options.map((value, index) =>
    fitOptionContent(labeledWord(value, question.contentFormat, media, String.fromCharCode(65 + index) + '.'))
  );
  const rows = [];
  for (let i = 0; i < cells.length; i += 2) {
    const cell = (content) =>
      '<w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>' +
      (content || wordParagraph()) +
      (content && !content.endsWith('</w:p>') ? wordParagraph() : '') +
      '</w:tc>';
    rows.push('<w:tr><w:trPr><w:cantSplit/></w:trPr>' + cell(cells[i]) + cell(cells[i + 1]) + '</w:tr>');
  }
  const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((side) => '<w:' + side + ' w:val="nil"/>')
    .join('');
  return (
    '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>' +
    borders +
    '</w:tblBorders><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="4500"/><w:gridCol w:w="4500"/></w:tblGrid>' +
    rows.join('') +
    '</w:tbl>'
  );
}
