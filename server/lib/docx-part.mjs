// DOCX arxividagi XML qismini xavfsiz o'qiydi.
import { parseXml } from './docx-xml.mjs';
export function parsePart(files, name) {
  if (!files[name]) return null;
  return parseXml(files[name], name);
}
