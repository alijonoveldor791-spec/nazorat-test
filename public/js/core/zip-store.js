// XLSX uchun tashqi kutubxonasiz, siqilmagan ZIP arxivini yig'adi.
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
  const bytes = new Uint8Array(size),
    view = new DataView(bytes.buffer);
  for (const [offset, value, width] of fields) {
    if (width === 2) view.setUint16(offset, value, true);
    else view.setUint32(offset, value, true);
  }
  return bytes;
}
function concat(parts) {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}
export function zipStore(files) {
  const parts = [],
    directory = [];
  let offset = 0;
  for (const [path, text] of Object.entries(files)) {
    const name = ENCODER.encode(path),
      data = ENCODER.encode(text),
      crc = crc32(data);
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
  const central = concat(directory),
    count = Object.keys(files).length;
  const end = header(22, [
    [0, 0x06054b50],
    [8, count, 2],
    [10, count, 2],
    [12, central.length],
    [16, offset],
  ]);
  return concat([...parts, central, end]);
}
