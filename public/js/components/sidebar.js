// Panel navigatsiyasi barcha o’qituvchi sahifalarida bir xil bo’lishi uchun.
export const TEACHER_PAGES = {
  dashboard: ['index.html', 'Bosh sahifa', '▦'],
  classes: ['sinflar.html', 'Sinflar', '♧'],
  tests: ['testlar.html', 'Testlar', '▤'],
  results: ['natijalar.html', 'Natijalar', '▥'],
  settings: ['sozlamalar.html', 'Sozlamalar', '⚙'],
};

export function sidebar(active) {
  return `<aside class="sidebar">
<a class="brand" href="/oqituvchi/index.html">
<span class="brand-mark">N</span>Nazorat</a>
    <nav class="nav" aria-label="Panel bo’limlari">${Object.entries(TEACHER_PAGES)
      .map(
        ([key, [, title, icon]]) =>
          `<button data-page="${key}" class="${active === key ? 'active' : ''}" ${active === key ? 'aria-current="page"' : ''}>
        <span class="nav-icon" aria-hidden="true">${icon}</span>${title}</button>`
      )
      .join('')}</nav>
    <div class="sidebar-bottom">
<p class="help">Bilimni o’lchang.<br>Rivojlanishni kuzating.</p>
      <a class="btn secondary" href="/">O’quvchi sahifasi ↗</a>
</div>
</aside>`;
}
