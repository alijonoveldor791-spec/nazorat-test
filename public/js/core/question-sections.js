// Savollar tartibini o'zgartirmasdan asosiy va majburiy fan bo'limlarini guruhlaydi.
export function questionSections(questions) {
  const sections = new Map();
  questions.forEach((question, index) => {
    const section = question.section || { id: 'unsectioned', type: 'Test', subject: 'Umumiy savollar' };
    if (!sections.has(section.id))
      sections.set(section.id, {
        ...section,
        indexes: [],
        category: /majburiy/i.test(section.type)
          ? 'required'
          : section.id === 'unsectioned'
            ? 'general'
            : 'main',
      });
    sections.get(section.id).indexes.push(index);
  });
  return [...sections.values()];
}
export const SECTION_CATEGORIES = [
  ['main', 'Asosiy fanlar'],
  ['required', 'Majburiy fanlar'],
  ['general', 'Boshqa savollar'],
];
