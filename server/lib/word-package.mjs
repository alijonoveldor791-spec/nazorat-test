// Native paragraflar va mediani makrossiz, tashqi bog'lanishsiz haqiqiy DOCX paketiga yig'adi.
import { zipSync, strToU8 } from 'fflate';
import { wordEscape } from './word-xml.mjs';
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
function styles() {
  const named = (id, size) =>
    '<w:style w:type="paragraph" w:styleId="' +
    id +
    '"><w:name w:val="' +
    id +
    '"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="' +
    size +
    '"/></w:rPr></w:style>';
  return (
    XML +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    named('Title', 32) +
    named('Heading1', 28) +
    named('Heading2', 25) +
    '</w:styles>'
  );
}
export function wordPackage(body, media) {
  const files = { ...media.files };
  const part = (path, content) => {
    files[path] = strToU8(XML + content);
  };
  const relation = ({ id, type, target }) =>
    '<Relationship Id="' +
    wordEscape(id) +
    '" Type="' +
    REL +
    type +
    '" Target="' +
    wordEscape(target) +
    '"/>';
  part(
    '_rels/.rels',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      relation({ id: 'office', type: 'officeDocument', target: 'word/document.xml' }) +
      '</Relationships>'
  );
  part(
    'word/_rels/document.xml.rels',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      [{ id: 'styles', type: 'styles', target: 'styles.xml' }, ...media.relations].map(relation).join('') +
      '</Relationships>'
  );
  part(
    'word/document.xml',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="' +
      REL.slice(0, -1) +
      '" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>' +
      body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1100" w:bottom="1100" w:left="1200" w:right="1200" w:header="500" w:footer="500"/></w:sectPr></w:body></w:document>'
  );
  files['word/styles.xml'] = strToU8(styles());
  part(
    '[Content_Types].xml',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      [...media.types]
        .map(([ext, type]) => '<Default Extension="' + ext + '" ContentType="' + type + '"/>')
        .join('') +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
  );
  return zipSync(files, { level: 6 });
}
