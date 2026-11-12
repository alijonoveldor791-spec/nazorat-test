// components/class-chart.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { percent } from '../core/format.js';
import { empty } from './empty-state.js';
export function classChart(results) {
  const groups = new Map();
  for (const r of results) {
    const name = r.grade || 'Guruhsiz';
    const a = groups.get(name) || [];
    a.push(percent(r));
    groups.set(name, a);
  }
  const entries = [...groups].sort(([a], [b]) => a.localeCompare(b)).slice(0, 20);
  if (!entries.length) return empty('Diagramma uchun natijalar kerak');
  return `<svg class="bar-chart" role="img" aria-label="Sinflar o'rtacha foizlari" viewBox="0 0 420 ${entries.length * 64 + 8}">${entries
    .map(([name, values], i) => {
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      return `<g><title>${esc(name)}: ${avg}%</title><text x="0" y="${i * 64 + 18}">${esc(name.length > 38 ? name.slice(0, 37) + '…' : name)}</text>
<rect x="0" y="${i * 64 + 28}" rx="5" width="${Math.max(2, avg * 3.5)}" height="20"/>
<text x="375" y="${i * 64 + 44}">${avg}%</text></g>`;
    })
    .join('')}</svg>`;
}
