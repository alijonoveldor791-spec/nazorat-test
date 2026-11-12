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
export function wordTable(rows, { widths = [], keepRows = false, totalWidth = 9000 } = {}) {
  const size = Math.max(1, ...rows.map((row) => row.reduce((sum, c) => sum + (c.span || 1), 0)));
  const width = Math.floor(totalWidth / size);
  const columns =
    widths.length === size && widths.every((n) => Number.isInteger(n) && n > 0)
      ? widths
      : Array(size).fill(width);
  const border = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((side) => '<w:' + side + ' w:val="single" w:sz="4" w:color="A0A0A0"/>')
    .join('');
  return (
    '<w:tbl><w:tblPr><w:tblW w:w="' +
    totalWidth +
    '" w:type="dxa"/><w:tblBorders>' +
    border +
    '</w:tblBorders>' +
    (widths.length === size ? '<w:tblLayout w:type="fixed"/>' : '') +
    '</w:tblPr><w:tblGrid>' +
    columns.map((column) => '<w:gridCol w:w="' + column + '"/>').join('') +
    '</w:tblGrid>' +
    rows
      .map((row) => {
        let column = 0;
        const rowProps =
          (row.every((c) => c.header) ? '<w:tblHeader/>' : '') + (keepRows ? '<w:cantSplit/>' : '');
        return (
          '<w:tr>' +
          (rowProps ? '<w:trPr>' + rowProps + '</w:trPr>' : '') +
          row
            .map((cell) => {
              const cellWidth = columns
                .slice(column, column + (cell.span || 1))
                .reduce((sum, n) => sum + n, 0);
              column += cell.span || 1;
              const fill = /^[A-F0-9]{6}$/i.test(cell.fill || '') ? cell.fill : cell.header ? 'E8ECF2' : '';
              const props =
                '<w:tcW w:w="' +
                cellWidth +
                '" w:type="dxa"/>' +
                (cell.span > 1 ? '<w:gridSpan w:val="' + cell.span + '"/>' : '') +
                (cell.merge ? '<w:vMerge w:val="' + cell.merge + '"/>' : '') +
                (fill ? '<w:shd w:fill="' + fill + '"/>' : '');
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
        );
      })
      .join('') +
    '</w:tbl>'
  );
}
