// O'quvchi sahifalarining umumiy navigatsiyasi.
export function mountStudentHeader() {
  document.getElementById('student-header').innerHTML = `<header class="site-header">
    <a class="brand" href="/">
<span class="brand-mark" aria-hidden="true">N</span>Nazorat <span class="muted">/ test</span>
</a>
    <section id="student-test-meta" class="student-test-meta" aria-label="Test holati" hidden>
      <div class="student-test-heading"><h1 id="ttl"></h1><span class="badge" id="test-nav-question-number"></span></div>
      <div class="student-test-status">
        <p id="prog"></p><p id="save-status" class="help" role="status">Javoblar saqlanadi</p>
      </div>
      <progress class="progress" id="progress" value="0" max="100" aria-label="Javob berilgan savollar"></progress>
    </section>
    <div class="row">
<a class="btn ghost" href="/oqituvchi/kirish.html">O'qituvchi paneli ↗</a>
      <button class="btn icon secondary" data-theme-toggle aria-label="Rang rejimini almashtirish">◐</button>
</div>
</header>`;
}
