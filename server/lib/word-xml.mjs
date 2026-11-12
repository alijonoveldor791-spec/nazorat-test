// Word hujjatining xavfsiz matn, paragraf va jadval elementlarini yaratadi.
export const wordEscape = (value) =>
  String(value ?? '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]
    );
export function wordRun(text, properties = '') {
  properties = [
    ...new Map(
      [...properties.matchAll(/<w:([A-Za-z]+)\b[^>]*\/>/g)].map((match) => [match[1], match[0]])
    ).values(),
  ].join('');
  return (
    '<w:r>' +
    (properties ? '<w:rPr>' + properties + '</w:rPr>' : '') +
    String(text ?? '')
      .split(/\r?\n/)
      .map((line) => '<w:t xml:space="preserve">' + wordEscape(line) + '</w:t>')
      .join('<w:br/>') +
    '</w:r>'
  );
}
export function wordParagraph(content = '', style = '', align = '') {
  const properties =
    (style ? '<w:pStyle w:val="' + wordEscape(style) + '"/>' : '') +
    (align ? '<w:jc w:val="' + wordEscape(align) + '"/>' : '');
  return '<w:p>' + (properties ? '<w:pPr>' + properties + '</w:pPr>' : '') + content + '</w:p>';
}
export const wordText = (text, style = '') => wordParagraph(wordRun(text), style);
export function wordTable(rows) {
  const size = Math.max(1, ...rows.map((row) => row.reduce((sum, c) => sum + (c.span || 1), 0)));
  const width = Math.floor(9000 / size);
  const border = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((side) => '<w:' + side + ' w:val="single" w:sz="4" w:color="A0A0A0"/>')
    .join('');
  return (
    '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>' +
    border +
    '</w:tblBorders></w:tblPr><w:tblGrid>' +
    Array(size)
      .fill('<w:gridCol w:w="' + width + '"/>')
      .join('') +
    '</w:tblGrid>' +
    rows
      .map(
        (row) =>
          '<w:tr>' +
          (row.every((c) => c.header) ? '<w:trPr><w:tblHeader/></w:trPr>' : '') +
          row
            .map((cell) => {
              const props =
                '<w:tcW w:w="' +
                width * (cell.span || 1) +
                '" w:type="dxa"/>' +
                (cell.span > 1 ? '<w:gridSpan w:val="' + cell.span + '"/>' : '') +
                (cell.merge ? '<w:vMerge w:val="' + cell.merge + '"/>' : '') +
                (cell.header ? '<w:shd w:fill="E8ECF2"/>' : '');
              const content = cell.content || wordParagraph();
              return (
                '<w:tc><w:tcPr>' +
                props +
                '</w:tcPr>' +
                content +
                (content.endsWith('</w:p>') ? '' : wordParagraph()) +
                '</w:tc>'
              );
            })
            .join('') +
          '</w:tr>'
      )
      .join('') +
    '</w:tbl>'
  );
}
