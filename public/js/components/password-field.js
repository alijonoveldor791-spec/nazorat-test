// Parol maydoni va sichqoncha yoki klaviatura orqali ko\'rsatish/berkitish.
import { esc } from '../core/dom.js';
const initialized = new WeakSet();
const EYE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
<circle cx="12" cy="12" r="3"/>
<path class="password-eye-slash" d="m4 4 16 16"/>
</svg>`;
export function passwordField(id, label, autocomplete = 'current-password', minimum = 6, maximum = 12) {
  return `<div><label for="${esc(id)}">${esc(label)}</label>
<div class="password-field">
<input id="${esc(id)}" type="password" autocomplete="${esc(autocomplete)}" minlength="${minimum}" maxlength="${maximum}" required>
<button type="button" class="password-toggle" data-password-toggle="${esc(id)}" aria-controls="${esc(id)}" aria-pressed="false" aria-label="Parolni ko\'rsatish">${EYE_ICON}</button>
</div></div>`;
}
export function initPasswordVisibility(root = document) {
  if (initialized.has(root)) return;
  initialized.add(root);
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-password-toggle]');
    if (!button || !root.contains(button)) return;
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input || !['password', 'text'].includes(input.type)) return;
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(visible));
    button.setAttribute('aria-label', visible ? 'Parolni berkitish' : "Parolni ko'rsatish");
  });
}
