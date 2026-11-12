// Natija DOCXidagi ichki rasmlarni tekshiradi, takrorini birlashtiradi va DrawingML yaratadi.
import { createHash } from 'node:crypto';
import { fail } from './http.mjs';
import { wordEscape } from './word-xml.mjs';
function imageSize(bytes, type) {
  if (type === 'png') return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  if (type === 'gif') return [bytes.readUInt16LE(6), bytes.readUInt16LE(8)];
  if (type === 'webp' && bytes.length >= 30) {
    const kind = bytes.subarray(12, 16).toString();
    if (kind === 'VP8X') return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
    if (kind === 'VP8 ') return [bytes.readUInt16LE(26) & 16383, bytes.readUInt16LE(28) & 16383];
    if (kind === 'VP8L') {
      const value = bytes.readUInt32LE(21);
      return [1 + (value & 16383), 1 + ((value >>> 14) & 16383)];
    }
  }
  if (type === 'jpeg') {
    for (let i = 2; i + 8 < bytes.length;) {
      if (bytes[i] !== 255) break;
      const marker = bytes[i + 1],
        length = bytes.readUInt16BE(i + 2);
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker))
        return [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)];
      if (length < 2 || marker === 218 || marker === 217) break;
      i += length + 2;
    }
  }
  return [600, 400];
}
export function createWordMedia() {
  const files = {},
    types = new Map(),
    relations = [],
    known = new Map();
  let count = 0,
    total = 0;
  function image(node) {
    const match = /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/.exec(
      node.getAttribute('src') || ''
    );
    if (!match) fail('Word eksportida rasm manbasi yaroqsiz.');
    const [, type, encoded] = match,
      bytes = Buffer.from(encoded, 'base64');
    const valid =
      type === 'png'
        ? bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : type === 'jpeg'
          ? bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : type === 'gif'
            ? bytes.length >= 10 && /^GIF8[79]a/.test(bytes.subarray(0, 6).toString())
            : bytes.length >= 12 &&
              bytes.subarray(0, 4).toString() === 'RIFF' &&
              bytes.subarray(8, 12).toString() === 'WEBP';
    if (!valid) fail('Word eksportida rasm formati buzilgan.');
    const digest = createHash('sha256').update(bytes).digest('hex');
    let resource = known.get(digest);
    if (!resource) {
      if ((total += bytes.length) > 10_000_000) fail('Word rasmlarining umumiy hajmi 10 MB dan oshdi.');
      const name = 'image-' + (known.size + 1) + '.' + type;
      resource = { name, id: 'image' + (known.size + 1) };
      known.set(digest, resource);
      files['word/media/' + name] = bytes;
      types.set(type, 'image/' + type);
      relations.push({ id: resource.id, type: 'image', target: 'media/' + name });
    }
    const dimensions = imageSize(bytes, type);
    const [width, height] = dimensions.map((n) => Math.max(1, n));
    const scale = Math.min(1, 600 / width, 750 / height),
      cx = Math.max(1, Math.round(width * scale * 9525)),
      cy = Math.max(1, Math.round(height * scale * 9525)),
      id = ++count;
    const name = wordEscape(resource.name),
      alt = wordEscape(node.getAttribute('alt') || 'Savol rasmi');
    return (
      '<w:r><w:drawing><wp:inline><wp:extent cx="' +
      cx +
      '" cy="' +
      cy +
      '"/><wp:docPr id="' +
      id +
      '" name="' +
      name +
      '" descr="' +
      alt +
      '"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="' +
      id +
      '" name="' +
      name +
      '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' +
      resource.id +
      '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' +
      cx +
      '" cy="' +
      cy +
      '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>'
    );
  }
  return { files, types, relations, image };
}
