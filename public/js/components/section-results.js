// O'quvchi va o'qituvchi uchun fan bo'limlarining xavfsiz natija jadvalini chizadi.
import { esc } from '../core/dom.js';
export function sectionResultsMarkup(value) {
  if (!Array.isArray(value) || !value.length) return '';
  return `<section class="section-results answer-detail"><h2>Fanlar bo'yicha natija</h2><div class="table-wrap"><table><thead><tr><th>Bo'lim</th><th>Fan</th><th>Ball</th></tr></thead><tbody>${value
    .filter((s) => s && typeof s.subject === 'string')
    .map(
      (s) =>
        `<tr><td>${esc(s.type)}</td><td>${esc(s.subject)}</td><td>${esc(s.score)} / ${esc(s.total)}</td></tr>`
    )
    .join('')}</tbody></table></div></section>`;
}
