// Blok test xaritasini asosiy/majburiy guruhlar va ochilib-yopiladigan fanlar bilan tasvirlaydi.
import { el } from '../core/dom.js';
import { questionSections, SECTION_CATEGORIES } from '../core/question-sections.js';
import { view6 } from './test-runner-page/view6.js';
const questionButton = (scope, index) =>
  view6(
    scope,
    index,
    scope.state.current === index,
    scope.state.answers[index] !== null,
    scope.state.flags.includes(index)
  );
export function sectionMap(scope) {
  const questions = scope.state.questions;
  if (!questions.some((question) => question.section))
    return el(
      'div',
      { className: 'question-map-grid' },
      questions.map((_, index) => questionButton(scope, index))
    );
  const sections = questionSections(questions);
  return el(
    'div',
    { className: 'section-map' },
    SECTION_CATEGORIES.map(([category, label]) => {
      const subjects = sections.filter((section) => section.category === category);
      if (!subjects.length) return null;
      const open = scope.openCategory === category;
      return el(
        'section',
        { key: category, className: 'map-category' },
        el(
          'h3',
          null,
          el(
            'button',
            {
              type: 'button',
              className: 'map-category-toggle',
              'aria-expanded': open,
              'aria-controls': `map-${category}`,
              onClick: () => {
                scope.setOpenCategory(open ? null : category);
                if (!open) scope.setOpenSection(subjects[0].id);
              },
            },
            label,
            el('span', { 'aria-hidden': true }, open ? '−' : '+')
          )
        ),
        el(
          'div',
          { id: `map-${category}`, hidden: !open },
          subjects.map((section, position) => {
            const expanded = scope.openSection === section.id;
            const answered = section.indexes.filter((index) => scope.state.answers[index] !== null).length;
            const id = `map-${category}-${position}`;
            return el(
              'section',
              { key: section.id, className: 'map-subject' },
              el(
                'h4',
                null,
                el(
                  'button',
                  {
                    type: 'button',
                    className: 'map-subject-toggle',
                    'aria-expanded': expanded,
                    'aria-controls': id,
                    onClick: () => scope.setOpenSection(expanded ? null : section.id),
                  },
                  el('strong', null, section.subject),
                  el('small', null, section.type, ` · ${answered}/${section.indexes.length}`)
                )
              ),
              el(
                'div',
                { id, hidden: !expanded, className: 'question-map-grid' },
                section.indexes.map((index) => questionButton(scope, index))
              )
            );
          })
        )
      );
    })
  );
}
