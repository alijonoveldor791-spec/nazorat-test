// XLSX hujjati uchun XML va ZIP paketini mahalliy yaratadi.
const ENCODER = new TextEncoder();
const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 255];
  return (crc ^ 0xffffffff) >>> 0;
}
function header(size, fields) {
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  for (const [offset, value, width] of fields) {
    if (width === 2) view.setUint16(offset, value, true);
    else view.setUint32(offset, value, true);
  }
  return bytes;
}
function concatBytes(parts) {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}
function zipStore(files) {
  const parts = [];
  const directory = [];
  let offset = 0;
  for (const [path, text] of Object.entries(files)) {
    const name = ENCODER.encode(path);
    const data = ENCODER.encode(text);
    const crc = crc32(data);
    const local = header(30, [
      [0, 0x04034b50],
      [4, 20, 2],
      [14, crc],
      [18, data.length],
      [22, data.length],
      [26, name.length, 2],
    ]);
    const central = header(46, [
      [0, 0x02014b50],
      [4, 20, 2],
      [6, 20, 2],
      [16, crc],
      [20, data.length],
      [24, data.length],
      [28, name.length, 2],
      [42, offset],
    ]);
    parts.push(local, name, data);
    directory.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const central = concatBytes(directory);
  const count = Object.keys(files).length;
  const end = header(22, [
    [0, 0x06054b50],
    [8, count, 2],
    [10, count, 2],
    [12, central.length],
    [16, offset],
  ]);
  return concatBytes([...parts, central, end]);
}
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const xmlEsc = (value) =>
  String(value ?? '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] || c
    );
function columnName(index) {
  let text = '';
  for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) {
    text = String.fromCharCode(65 + ((n - 1) % 26)) + text;
  }
  return text;
}
function worksheet(sheet) {
  const rows = sheet.rows
    .map(
      (row, r) =>
        `<row r="${r + 1}" ht="${r === 0 ? 32 : 24}" customHeight="1">` +
        row
          .map((item, c) => {
            const cell = item !== null && typeof item === 'object' ? item : { value: item };
            const ref = columnName(c) + (r + 1);
            const style = cell.style ?? (r === 0 ? 1 : r === 1 ? 2 : c === 1 ? 4 : 0);
            const attr = ` r="${ref}" s="${style}"`;
            return typeof cell.value === 'number' && Number.isFinite(cell.value)
              ? `<c${attr}><v>${cell.value}</v></c>`
              : `<c${attr} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(cell.value)}</t></is></c>`;
          })
          .join('') +
        '</row>'
    )
    .join('');
  const cols = sheet.widths
    .map((width, i) => `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`)
    .join('');
  return (
    XML +
    `<worksheet xmlns="${NS}"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0"><pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${rows}</sheetData>` +
    (sheet.merges?.length
      ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>`
      : '') +
    '<printOptions horizontalCentered="1"/><pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>'
  );
}
function stylesXml() {
  const font = (size, bold = '') => `<font>${bold}<sz val="${size}"/><name val="Times New Roman"/></font>`;
  const xf = (fontId, fillId, numFmtId = 0, alignment = 'center') =>
    `<xf numFmtId="${numFmtId}" fontId="${fontId}" fillId="${fillId}" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="${alignment}" vertical="center" wrapText="1"/></xf>`;
  return (
    XML +
    `<styleSheet xmlns="${NS}"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.0"/></numFmts><fonts count="3">${font(14)}${font(20, '<b/>')}${font(14, '<b/>')}</fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9DFE7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5">${xf(0, 0)}${xf(1, 0)}${xf(2, 2)}${xf(2, 0, 164)}${xf(0, 0, 0, 'left')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
  );
}
function xlsxWorkbook(sheets) {
  const files = {};
  const names = new Set();
  const entries = sheets.map((sheet, i) => {
    const base =
      String(sheet.name || 'Natijalar')
        .replace(/[\\/?*\[\]:]/g, '-')
        .replace(/^'+|'+$/g, '')
        .slice(0, 25) || 'Natijalar';
    let name = base;
    let suffix = 1;
    while (names.has(name.toLowerCase())) {
      const tail = ` (${suffix++})`;
      name = base.slice(0, 31 - tail.length) + tail;
    }
    names.add(name.toLowerCase());
    files[`xl/worksheets/sheet${i + 1}.xml`] = worksheet(sheet);
    return { name, id: i + 1 };
  });
  const rel = (id, type, target) => `<Relationship Id="rId${id}" Type="${REL}/${type}" Target="${target}"/>`;
  files['_rels/.rels'] =
    XML +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rel(1, 'officeDocument', 'xl/workbook.xml')}</Relationships>`;
  files['xl/workbook.xml'] =
    XML +
    `<workbook xmlns="${NS}" xmlns:r="${REL}"><sheets>${entries
      .map((s) => `<sheet name="${xmlEsc(s.name)}" sheetId="${s.id}" r:id="rId${s.id}"/>`)
      .join('')}</sheets></workbook>`;
  files['xl/_rels/workbook.xml.rels'] =
    XML +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries
      .map((s) => rel(s.id, 'worksheet', `worksheets/sheet${s.id}.xml`))
      .join('')}${rel(entries.length + 1, 'styles', 'styles.xml')}</Relationships>`;
  files['xl/styles.xml'] = stylesXml();
  const override = (part, type) =>
    `<Override PartName="/${part}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.${type}+xml"/>`;
  files['[Content_Types].xml'] =
    XML +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${override('xl/workbook.xml', 'sheet.main')}${override('xl/styles.xml', 'styles')}${entries
      .map((s) => override(`xl/worksheets/sheet${s.id}.xml`, 'worksheet'))
      .join('')}</Types>`;
  return zipStore(files);
}

export { xlsxWorkbook, columnName };
