// O'quvchi sahifalarining umumiy navigatsiyasi.
export function mountStudentHeader({ testMode = false } = {}) {
  if (testMode) {
    document.getElementById('student-header').innerHTML = testHeader();
    return;
  }
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
function testHeader() {
  return `<header class="site-header test-active test-navbar" aria-label="Test navigatsiyasi">
    <div class="brand test-navbar-brand" aria-label="Nazorat test muhiti">
      <span class="brand-mark" aria-hidden="true">N</span>
      <span>Nazorat<span class="test-navbar-caption">O'quvchi test muhiti</span></span>
    </div>
    <section id="student-test-meta" class="student-test-meta" aria-label="Test holati" hidden>
      <div class="student-test-heading">
        <h1 id="ttl"></h1>
        <span class="badge" id="test-nav-question-number"></span>
      </div>
      <div class="student-test-status">
        <p id="prog"></p>
        <p id="save-status" class="help" role="status">Javoblar saqlanadi</p>
      </div>
      <progress class="progress" id="progress" value="0" max="100" aria-label="Javob berilgan savollar"></progress>
    </section>
    <div class="test-navbar-tools">
      <button class="btn secondary" type="button" data-theme-toggle aria-label="Rang rejimini almashtirish">
        <span aria-hidden="true">◐</span><span>Ko'rinish</span>
      </button>
    </div>
  </header>`;
}
