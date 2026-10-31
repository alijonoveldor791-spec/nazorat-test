// components/page-heading.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
export const heading = (title, subtitle, actions = '') =>
  `<div class="admin-heading">
<div>
<div class="eyebrow">O’QITUVCHI MAYDONI</div>
<h1>${title}</h1>
<p>${subtitle}</p>
</div>
<div class="row no-print">${actions}</div>
</div>`;
export const action = (name, label, id = '', kind = '') =>
  `<button class="btn ${kind}" data-action="${name}" data-id="${esc(id)}">${label}</button>`;
