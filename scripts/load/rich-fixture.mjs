// Sun'iy blok uchun formula, jadval va haqiqiy PNG rasmli savollarni yaratadi.
import { zlibSync } from 'fflate';
function png() {
  const width = 160,
    height = 100,
    raw = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width * 3; x++) raw[y * (width * 3 + 1) + x + 1] = (x * 13 + y * 37 + x * y) % 256;
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    let crc = -1;
    for (const byte of body) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length);
    body.copy(out, 4);
    out.writeUInt32BE((crc ^ -1) >>> 0, out.length - 4);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', Buffer.from(zlibSync(raw))),
    chunk('IEND', Buffer.alloc(0)),
  ]).toString('base64');
}
export function fixtureQuestions(kind) {
  const image = png();
  const sizes = [30, 30, 10, 10, 10],
    subjects = ['Matematika', 'Fizika', 'Matematika', 'Ona tili', 'Tarix'];
  let index = 0;
  if (kind === 'ordinary')
    return Array.from({ length: 20 }, (_, i) => ({
      q: `Suniy ${i + 1}-savol`,
      options: ['A', 'B', 'C', 'D'],
      answer: i % 4,
    }));
  return sizes.flatMap((count, section) =>
    Array.from({ length: count }, (_, i) => {
      const n = index++;
      return {
        contentFormat: 'rich-html-v1',
        section: {
          id: `section-${section}`,
          type: section < 2 ? `${section + 1}-mutaxassislik fani` : 'Majburiy fan',
          subject: subjects[section],
        },
        q: `<p>${n + 1}. Hisoblang</p><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>x</mi><mn>2</mn></mfrac></math><table><tbody><tr><td>x</td><td>4</td></tr></tbody></table>${i === 0 ? `<p><img src="data:image/png;base64,${image}" alt="Suniy grafik"/></p>` : ''}`,
        options: ['<p>A</p>', '<p>B</p>', '<p>C</p>', '<p>D</p>'],
        answer: n % 4,
      };
    })
  );
}
