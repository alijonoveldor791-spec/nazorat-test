// DOCX ZIPni diskka chiqarmasdan, haqiqiy ochilgan baytlar va yo'llar limiti bilan o'qiydi.
import yauzl from 'yauzl';
import { fail } from './http.mjs';
export async function readDocxArchive(buffer) {
  if (!buffer.length || buffer.length > 1_500_000) fail('Word fayli 1,5 MB dan oshmasin.', 413);
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      buffer,
      { lazyEntries: true, strictFileNames: true, validateEntrySizes: true },
      (error, zip) => {
        if (error) return reject(new Error('DOCX ZIP fayli buzilgan.'));
        const files = new Map();
        let total = 0,
          count = 0,
          stopped = false;
        const timer = setTimeout(() => stop(new Error('DOCX ochish vaqti tugadi.')), 8000);
        function stop(error) {
          if (stopped) return;
          stopped = true;
          clearTimeout(timer);
          zip.close();
          reject(error);
        }
        zip.on('error', stop);
        zip.on('entry', (entry) => {
          try {
            const name = entry.fileName;
            if (
              ++count > 300 ||
              files.has(name) ||
              /(^\/|\\|:|(^|\/)\.\.?($|\/))/.test(name) ||
              ((entry.externalFileAttributes >>> 16) & 0xf000) === 0xa000 ||
              entry.generalPurposeBitFlag & 1
            )
              fail("ZIP yo'li, takror yozuvi yoki shifrlash qabul qilinmaydi.");
            if (entry.uncompressedSize > 4_000_000 || total + entry.uncompressedSize > 12_000_000)
              fail('DOCX ochilgan hajmi limitdan oshdi.');
            if (/vbaProject|embeddings\//i.test(name))
              fail('MathType/OLE yoki makro bor. Word Equation formatiga aylantiring.');
            zip.openReadStream(entry, (error, stream) => {
              if (error) return stop(error);
              const chunks = [];
              let size = 0;
              stream.on('error', stop);
              stream.on('data', (chunk) => {
                if (stopped) {
                  stream.destroy();
                  return;
                }
                size += chunk.length;
                total += chunk.length;
                if (size > 4_000_000 || total > 12_000_000) {
                  stream.destroy();
                  stop(new Error('DOCX ochilgan hajmi limitdan oshdi.'));
                } else chunks.push(chunk);
              });
              stream.on('end', () => {
                if (!stopped) {
                  files.set(name, Buffer.concat(chunks));
                  zip.readEntry();
                }
              });
            });
          } catch (error) {
            stop(error);
          }
        });
        zip.on('end', () => {
          if (!stopped) {
            stopped = true;
            clearTimeout(timer);
            resolve(files);
          }
        });
        zip.readEntry();
      }
    );
  });
}
