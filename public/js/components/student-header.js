// O'quvchi sahifalarining umumiy navigatsiyasi.
export function mountStudentHeader() {
  document.getElementById('student-header').innerHTML = `<header class="site-header">
    <a class="brand" href="/">
<span class="brand-mark" aria-hidden="true">N</span>Nazorat <span class="muted">/ test</span>
</a>
    <div class="row">
<a class="btn ghost" href="/oqituvchi/kirish.html">O'qituvchi paneli ↗</a>
      <button class="btn icon secondary" data-theme-toggle aria-label="Rang rejimini almashtirish">◐</button>
</div>
</header>`;
}
