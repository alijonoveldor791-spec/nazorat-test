// components/table.js: sahifaning shu vazifasi uchun modul.
import { resultScore } from '../core/result-score.js';
import { esc } from '../core/dom.js';
import { percent, dateTime } from '../core/format.js';
import { empty } from './empty-state.js';
import { action } from './page-heading.js';
export function rowsTable(rows, details = true, removable = false) {
  return rows.length
    ? `<div class="table-wrap">
<table>
<caption class="help">Natijalar · vaqt Toshkent bo\'yicha</caption>
<thead>
<tr>
<th>O\'quvchi</th>
<th>Test</th>
<th>Sinf yoki guruh</th>
<th>Ball</th>
<th>Foiz</th>
<th>Qoidabuzarlik</th>
<th>Vaqt</th>${details ? '<th>Amallar</th>' : ''}</tr>
</thead>
<tbody>${rows
        .map(
          (r) => `<tr>
<td>
<b>${esc(r.surname)} ${esc(r.name)}</b>
</td>
<td>${esc(r.testTitle || "O'chirilgan test")}</td>
<td>${esc(r.grade)}</td>
<td class="score-cell">${esc(resultScore(r))}</td>
<td>
<span class="badge ${percent(r) >= 60 ? 'success' : 'danger'}">${percent(r)}%</span>
</td>
<td>${esc(String(r.violationCount || 0))}${r.terminatedViolation ? ' ? Qoidabuzarlik tufayli yakunlangan' : ''}</td>
<td class="help">${esc(dateTime(r.time))}</td>${details ? `<td><div class="row">${action('result-detail', "Ko'rish", r.id, 'secondary small')}${removable ? action('delete-result', "O'chirish", r.id, 'danger small') : ''}</div></td>` : ''}</tr>`
        )
        .join('')}</tbody>
</table>
</div>`
    : empty("Hozircha natijalar yo'q", "O'quvchilar testni yuborgach natijalar shu yerda ko'rinadi.");
}
