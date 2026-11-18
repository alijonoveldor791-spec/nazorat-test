// Joriy filtrdagi barcha sahifalarning yozuvlarini alohida chop etish jadvaliga yig'adi.
import { formatDateTime, percent, resultScore } from '../../core/format.js';
import { statusLabel } from '../../core/result-status.js';
export function printResults(rows) {
  document.getElementById('results-print')?.remove();
  const panel = document.createElement('section');
  panel.id = 'results-print';
  const title = document.createElement('h1');
  title.textContent = 'Natijalar';
  panel.append(title);
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  for (const label of ['No', "O'quvchi", 'Sinf', 'Test', 'Natija', 'Foiz', 'Vaqt', 'Holat']) {
    const cell = document.createElement('th');
    cell.textContent = label;
    head.append(cell);
  }
  const body = table.createTBody();
  rows.forEach((row, index) => {
    const tr = body.insertRow();
    const values = [
      index + 1,
      `${row.surname || ''} ${row.name || ''}`,
      row.grade,
      row.testTitle,
      row.hasResult === false ? '—' : resultScore(row),
      row.hasResult === false ? '—' : `${percent(row)}%`,
      row.time ? formatDateTime(row.time) : '—',
      statusLabel(row),
    ];
    for (const value of values) tr.insertCell().textContent = String(value ?? '');
  });
  panel.append(table);
  document.body.append(panel);
  const cleanup = () => panel.remove();
  window.addEventListener('afterprint', cleanup, { once: true });
  try {
    window.print();
  } catch (error) {
    window.removeEventListener('afterprint', cleanup);
    cleanup();
    throw error;
  }
}
