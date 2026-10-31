// components/modal.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
export function modal(
  title,
  html,
  { confirm = 'Tasdiqlash', cancel = 'Bekor qilish', danger = false, onConfirm } = {}
) {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    const headingId = 'dialog-' + crypto.randomUUID();
    dialog.setAttribute('aria-labelledby', headingId);
    dialog.innerHTML = `<h2 id="${headingId}">${esc(title)}</h2>
<div class="dialog-body">${html}</div>
<div class="dialog-actions">
<button class="btn secondary" data-cancel>${esc(cancel)}</button>${confirm ? `<button class="btn ${danger ? 'danger' : ''}" data-confirm>${esc(confirm)}</button>` : ''}</div>`;
    document.body.append(dialog);
    let pending = false;
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error';
    errorMessage.setAttribute('role', 'alert');
    dialog.querySelector('.dialog-body').append(errorMessage);
    dialog.querySelector('[data-cancel]').onclick = () => {
      if (!pending) dialog.close('cancel');
    };
    dialog.addEventListener('cancel', (event) => {
      if (pending) event.preventDefault();
    });
    const accept = dialog.querySelector('[data-confirm]');
    if (accept)
      accept.onclick = async () => {
        if (pending) return;
        if (dialog.querySelector('form')?.reportValidity() === false) return;
        if ([...dialog.querySelectorAll('button')].some((button) => button !== accept && button.disabled)) {
          errorMessage.textContent = 'Joriy amal tugashini kuting.';
          return;
        }
        const controls = [...dialog.querySelectorAll('input,select,textarea,form button')].map((node) => [
          node,
          node.disabled,
        ]);
        controls.forEach(([node]) => {
          node.disabled = true;
        });
        pending = true;
        accept.disabled = true;
        errorMessage.textContent = '';
        try {
          if (onConfirm && (await onConfirm(dialog)) === false) return;
          dialog.close('confirm');
        } catch (error) {
          errorMessage.textContent = error.message;
          errorMessage.scrollIntoView({ block: 'nearest' });
        } finally {
          pending = false;
          accept.disabled = false;
          controls.forEach(([node, disabled]) => {
            node.disabled = disabled;
          });
        }
      };
    dialog.querySelectorAll('form').forEach((form) =>
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        accept?.click();
      })
    );
    dialog.addEventListener(
      'close',
      () => {
        resolve(dialog.returnValue === 'confirm' ? dialog : null);
        dialog.remove();
      },
      { once: true }
    );
    dialog.showModal();
  });
}
export const confirmAction = async (title, message) =>
  Boolean(await modal(title, `<p>${esc(message)}</p>`, { danger: true }));
