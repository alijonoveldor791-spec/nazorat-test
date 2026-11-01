// components/class-chart.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { percent } from '../core/format.js';
import { empty } from './empty-state.js';
export function classChart(results) {
  const groups = new Map();
  for (const r of results) {
    const a = groups.get(r.grade) || [];
    a.push(percent(r));
    groups.set(r.grade, a);
  }
  const entries = [...groups].sort(([a], [b]) => a.localeCompare(b)).slice(0, 20);
  if (!entries.length) return empty('Diagramma uchun natijalar kerak');
  return `<svg class="bar-chart" role="img" aria-label="Sinflar o'rtacha foizlari" viewBox="0 0 420 ${entries.length * 40 + 12}">${entries
    .map(([name, values], i) => {
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      return `<text x="0" y="${i * 40 + 25}">${esc(name)}</text>
<rect x="90" y="${i * 40 + 8}" rx="5" width="${Math.max(2, avg * 2.7)}" height="22"/>
<text x="${100 + avg * 2.7}" y="${i * 40 + 25}">${avg}%</text>`;
    })
    .join('')}</svg>`;
}
