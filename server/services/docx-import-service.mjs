// Word preview: xavfsiz parsing, savol diagnostikasi va xususiy original manba.
import { randomUUID } from 'node:crypto';
import { posix } from 'node:path';
import { readDocxArchive } from '../lib/docx-archive.mjs';
import { parseXml, elements, attr } from '../lib/docx-xml.mjs';
import { docxBlocks } from '../lib/docx-content.mjs';
import { splitDocxQuestions } from '../lib/docx-questions.mjs';
import { currentAccess, requireRole } from '../lib/access-context.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
import * as sources from '../repositories/import-sources-repo.mjs';
export async function previewDocx(payload, ip) {
  const auth = currentAccess();
  requireRole(auth, ['school_admin']);
  await limit('docx-import', auth.schoolId + '|' + ip, 10);
  if (
    typeof payload.docx !== 'string' ||
    payload.docx.length > 2_000_000 ||
    !/^[A-Za-z0-9+/]+=*$/.test(payload.docx)
  )
    fail("DOCX fayli formati yoki hajmi noto'g'ri.");
  const bytes = Buffer.from(payload.docx, 'base64');
  if (bytes.toString('base64') !== payload.docx) fail("DOCX base64 formati noto'g'ri.");
  let parsed;
  try {
    const files = await readDocxArchive(bytes);
    for (const name of ['[Content_Types].xml', '_rels/.rels', 'word/document.xml'])
      if (!files.has(name)) fail('DOCX majburiy qismlari topilmadi.');
    const types = parseXml(files.get('[Content_Types].xml'));
    if (
      !elements(types).some(
        (n) =>
          attr(n, 'PartName') === '/word/document.xml' &&
          attr(n, 'ContentType') ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'
      )
    )
      fail('Fayl oddiy DOCX hujjati emas.');
    const packageRels = parseXml(files.get('_rels/.rels'));
    if (
      !elements(packageRels).some(
        (n) =>
          attr(n, 'Type')?.endsWith('/officeDocument') &&
          attr(n, 'Target') === 'word/document.xml' &&
          attr(n, 'TargetMode') !== 'External'
      )
    )
      fail("DOCX asosiy hujjat bog'lanishi mos emas.");
    const rels = new Map();
    if (files.has('word/_rels/document.xml.rels'))
      for (const n of elements(parseXml(files.get('word/_rels/document.xml.rels')))) {
        if (attr(n, 'TargetMode') === 'External') fail('Tashqi resursli Word fayli qabul qilinmaydi.');
        const target = attr(n, 'Target') || '';
        const normalized = posix.normalize(posix.join('word', target));
        if (
          target.startsWith('/') ||
          /[:\\]/.test(target) ||
          !normalized.startsWith('word/') ||
          rels.has(attr(n, 'Id'))
        )
          fail("DOCX resurs yo'li yoki bog'lanishi noto'g'ri.");
        rels.set(attr(n, 'Id'), normalized);
      }
    const { blocks, images } = docxBlocks(parseXml(files.get('word/document.xml')), rels, files);
    parsed = splitDocxQuestions(blocks, images);
  } catch (error) {
    if (error.status) throw error;
    fail(error.message || "Word fayli o'qilmadi.");
  }
  const sourceId = randomUUID();
  await sources.create({ id: sourceId, original: payload.docx, created: new Date().toISOString() });
  return { ...parsed, sourceId, status: parsed.warnings.length ? 'manual-review' : 'complete' };
}
export async function requireImportSource(id) {
  if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id) || !(await sources.find(id)))
    fail('Word asl manbasi topilmadi yoki boshqa maktabga tegishli.', 403);
  return id;
}
