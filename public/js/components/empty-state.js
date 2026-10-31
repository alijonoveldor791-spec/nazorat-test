// components/empty-state.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
export const empty = (title, description = '') =>
  `<div class="empty">
<b>${esc(title)}</b>
<p>${esc(description)}</p>
</div>`;
