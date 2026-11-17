// Mavzular va testlarni chorak, so'ng eng yangi yuklangan sana bo'yicha tartiblaydi.
import { topicCard } from './library-view.js';
const timestamp = (value) => Date.parse(value) || 0;
export const topicTime = (topic) => topic.lastUploadedAt || topic.createdAt || null;
export const topicOrder = (a, b) =>
  a.quarter - b.quarter ||
  timestamp(topicTime(b)) - timestamp(topicTime(a)) ||
  a.name.localeCompare(b.name, 'uz') ||
  a.id.localeCompare(b.id);
export function renderTopicGroups(topics, selected) {
  let previous = null;
  return [...topics]
    .sort(topicOrder)
    .map((topic, index) => {
      const heading =
        previous !== topic.quarter ? `<h3 class="library-quarter-heading">${topic.quarter}-chorak</h3>` : '';
      previous = topic.quarter;
      return heading + topicCard(topic, index, selected.has(topic.id));
    })
    .join('');
}
export function selectionTitle(topics) {
  if (!topics.length) return '';
  return topics[0].subject + ' / ' + [...new Set(topics.map((t) => t.quarter))].sort().join(', ') + '-chorak';
}
export function orderedTests(tests, topics) {
  return tests
    .map((test) => ({
      ...test,
      libraryQuarters: [
        ...new Set(
          (test.composition?.topics || [])
            .map((t) => t.quarter || topics.find((row) => row.id === t.id)?.quarter)
            .filter(Boolean)
        ),
      ].sort(),
    }))
    .sort(
      (a, b) =>
        (a.libraryQuarters[0] || 5) - (b.libraryQuarters[0] || 5) ||
        timestamp(b.createdAt) - timestamp(a.createdAt) ||
        a.title.localeCompare(b.title, 'uz')
    );
}
