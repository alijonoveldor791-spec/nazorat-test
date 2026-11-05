// Test kartalarining tashqi kutubxonasiz dekorativ SVG belgilari.
const PATHS = {
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  question: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  repeat: '<path d="M20 7H7a4 4 0 0 0 0 8h2M4 17h13a4 4 0 0 0 0-8h-2M17 4l3 3-3 3M7 14l-3 3 3 3"/>',
  shuffle: '<path d="M3 6h3c5 0 7 12 12 12h3M3 18h3c2 0 4-3 6-6s4-6 6-6h3M18 3l3 3-3 3M18 15l3 3-3 3"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
};
export const cardIcon = (name) =>
  `<svg class="test-card-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
