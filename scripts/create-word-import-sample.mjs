// MathML, rasm, jadval va javob markerlari bor DOCX sinov namunasini yaratadi.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { zipSync, strToU8 } from 'fflate';

const fraction = '<m:f><m:num><m:r><m:t>1</m:t></m:r></m:num><m:den><m:r><m:t>2</m:t></m:r></m:den></m:f>';
const radical = '<m:rad><m:deg/><m:e><m:r><m:t>9</m:t></m:r></m:e></m:rad>';
const power = '<m:sSup><m:e><m:r><m:t>x</m:t></m:r></m:e><m:sup><m:r><m:t>2</m:t></m:r></m:sup></m:sSup>';
const integral = '<m:nary><m:naryPr><m:chr m:val="∫"/></m:naryPr><m:sub><m:r><m:t>0</m:t></m:r></m:sub><m:sup><m:r><m:t>1</m:t></m:r></m:sup><m:e>' + power + '</m:e></m:nary>';
const limit = '<m:limLow><m:e><m:r><m:t>lim</m:t></m:r></m:e><m:lim><m:sSub><m:e><m:r><m:t>x</m:t></m:r></m:e><m:sub><m:r><m:t>0</m:t></m:r></m:sub></m:sSub></m:lim></m:limLow>';
const matrix = '<m:m><m:mr><m:e><m:r><m:t>1</m:t></m:r></m:e><m:e><m:r><m:t>2</m:t></m:r></m:e></m:mr><m:mr><m:e><m:r><m:t>3</m:t></m:r></m:e><m:e><m:r><m:t>4</m:t></m:r></m:e></m:mr></m:m>';
const system = '<m:eqArr><m:e><m:r><m:t>x+y=3</m:t></m:r></m:e><m:e><m:r><m:t>x-y=1</m:t></m:r></m:e></m:eqArr>';
const math = (xml) => `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${xml}</m:oMath>`;
const run = (text, props = '') => `<w:r>${props}<w:t xml:space="preserve">${text}</w:t></w:r>`;
const para = (inner) => `<w:p>${inner}</w:p>`;
const option = (letter, text) => para(run(`${letter}. ${text}`));
const table = '<w:tbl><w:tblPr/><w:tr><w:tc>' + para(run('Jadval: a=1')) + '</w:tc><w:tc>' + para(run('b=2')) + '</w:tc></w:tr></w:tbl>';
const imageRun = '<w:r><w:drawing><wp:inline><wp:extent cx="1000000" cy="1000000"/><wp:docPr id="1" name="Rasm" descr="Namuna rasm"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:blipFill><a:blip r:embed="rId1"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
const image = `<w:p>${imageRun}</w:p>`;
const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${para(run('1. Hisoblang: ', '<w:rPr><w:b/><w:color w:val="000000"/></w:rPr>') + run(' Qizil rang', '<w:rPr><w:color w:val="FF0000"/></w:rPr>') + math(fraction) + run(' + ') + math(radical) + run(' + ') + math(integral) + run(' ; ') + math(limit) + run(' ; ') + math(matrix) + run(' ; ') + math(system))}${image}${table}${para(run('A. 0 # ichki belgi') + imageRun)}${para(run('# ') + run('B. ') + math(fraction))}${option('C','5')}<w:sectPr/></w:body></w:document>`;
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3f8AAAAASUVORK5CYII=', 'base64'));
const entries = {
  '[Content_Types].xml': strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),
  '_rels/.rels': strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId0" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'),
  'word/_rels/document.xml.rels': strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/sample.png"/></Relationships>'),
  'word/document.xml': strToU8(documentXml),
  'word/media/sample.png': png,
};
const target = fileURLToPath(new URL('../samples/word-import-sample.docx', import.meta.url));
writeFileSync(target, zipSync(entries, { level: 6 }));
console.log(`DOCX namuna yaratildi: ${target}`);
