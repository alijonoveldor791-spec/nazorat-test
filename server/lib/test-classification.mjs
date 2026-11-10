// Test turi, fan bo'limlari va auditoriya yo'nalishining mosligini tekshiradi.
import { fail } from './http.mjs';
import { string } from './validate.mjs';
export function testClassification(value, questions, classes) {
  const testType = value.testType ?? 'ordinary';
  if (!['ordinary', 'block'].includes(testType)) fail("Test turi noto'g'ri.");
  const direction = string(value.direction ?? '', "Yo'nalish", 100, false);
  if (classes.some((c) => c.kind === 'group' && c.direction !== direction))
    fail("Tanlangan guruh yo'nalishi mos emas.");
  if (testType === 'block' && questions.some((q) => !q.section))
    fail("Blok testning har savoli fan bo'limiga tegishli bo'lsin.");
  if (testType === 'ordinary' && questions.some((q) => q.section))
    fail("Fan bo'limlari uchun Blok test turini tanlang.");
  const sections = new Map();
  let previous = null;
  for (const q of questions) {
    if (!q.section) continue;
    const section = q.section;
    if (
      sections.has(section.id) &&
      (previous !== section.id || sections.get(section.id) !== JSON.stringify(section))
    )
      fail("Fan bo'limlari ketma-ketligi yoki sarlavhasi mos emas.");
    sections.set(section.id, JSON.stringify(section));
    previous = section.id;
  }
  return { testType, direction };
}
