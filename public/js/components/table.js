// components/table.js: sahifaning shu vazifasi uchun modul.
import {esc} from '../core/dom.js';
import {percent,dateTime} from '../core/format.js';
import {empty} from './empty-state.js';
import {action} from './page-heading.js';
export function rowsTable(rows, details = true) {
  return rows.length ? `<div class="table-wrap"><table><caption class="help">Natijalar · vaqt Toshkent bo’yicha</caption><thead><tr><th>O’quvchi</th><th>Sinf</th><th>Test</th><th>Ball</th><th>Foiz</th><th>Vaqt</th>${details ? '<th>Tafsilot</th>' : ''}</tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.surname)} ${esc(r.name)}</b></td><td>${esc(r.grade)}</td><td>${esc(r.testTitle || 'O’chirilgan test')}</td><td>${r.score}/${r.total}</td><td><span class="badge ${percent(r)>=60 ? 'success' : 'danger'}">${percent(r)}%</span></td><td class="help">${esc(dateTime(r.time))}</td>${details ? `<td>${action('result-detail','Ko’rish',r.id,'secondary small')}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : empty('Hozircha natijalar yo’q', 'O’quvchilar testni yuborgach natijalar shu yerda ko’rinadi.');
}
