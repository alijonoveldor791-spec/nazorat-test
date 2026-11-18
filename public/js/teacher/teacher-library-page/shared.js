// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
const LETTERS = 'ABCDEF';
function buildSuggestedTitle(chosen) {
  if (!chosen.length) return '';
  const quarters = Array.from(new Set(chosen.map((t) => `${t.quarter}-chorak`))).join(', ');
  return `${chosen[0].grade}-sinf ${chosen[0].subject} (${quarters})`;
}
export { LETTERS, buildSuggestedTitle };
