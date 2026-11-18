// Blok test muharririda faqat ochilgan fan savollarini chizib, katta testni yengillashtiradi.
import { el } from '../../core/dom.js';
import { questionSections, SECTION_CATEGORIES } from '../../core/question-sections.js';
export function sectionedEditor(scope, render) {
  if (!scope.questions.some((question) => question.section)) return scope.questions.map(render);
  const sections = questionSections(scope.questions);
  return SECTION_CATEGORIES.map(([category, label]) => {
    const subjects = sections.filter((section) => section.category === category);
    if (!subjects.length) return null;
    return el(
      'section',
      { key: category, className: 'editor-section-category' },
      el('h3', null, label),
      subjects.map((section, index) => {
        const open = scope.editorSection === section.id;
        return el(
          'section',
          { key: section.id, className: 'editor-subject' },
          el(
            'h4',
            null,
            el(
              'button',
              {
                type: 'button',
                className: 'map-subject-toggle',
                'aria-expanded': open,
                'aria-controls': `editor-${category}-${index}`,
                onClick: () => {
                  scope.setSelectedImg(null);
                  scope.setEditorSection(open ? null : section.id);
                },
              },
              el('strong', null, section.subject),
              el('small', null, `${section.type} · ${section.indexes.length} savol`)
            )
          ),
          open &&
            el(
              'div',
              { id: `editor-${category}-${index}`, className: 'space-y-4' },
              section.indexes.map((position) => render(scope.questions[position], position))
            )
        );
      })
    );
  });
}
