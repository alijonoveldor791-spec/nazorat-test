// components/modal.js: sahifaning shu vazifasi uchun modul.
import {esc} from '../core/dom.js';
export function modal(title, html, {confirm = 'Tasdiqlash', cancel = 'Bekor qilish', danger = false} = {}) {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    const headingId = 'dialog-' + crypto.randomUUID();
    dialog.setAttribute('aria-labelledby', headingId);
    dialog.innerHTML = `<h2 id="${headingId}">${esc(title)}</h2><div class="dialog-body">${html}</div><div class="dialog-actions"><button class="btn secondary" data-cancel>${esc(cancel)}</button>${confirm ? `<button class="btn ${danger ? 'danger' : ''}" data-confirm>${esc(confirm)}</button>` : ''}</div>`;
    document.body.append(dialog);
    dialog.querySelector('[data-cancel]').onclick = () => dialog.close('cancel');
    const accept = dialog.querySelector('[data-confirm]');
    if (accept) accept.onclick = () => { if (dialog.querySelector('form')?.reportValidity() === false) return; dialog.close('confirm'); };
    dialog.addEventListener('close', () => { resolve(dialog.returnValue === 'confirm' ? dialog : null); dialog.remove(); }, {once:true});
    dialog.showModal();
  });
}
export const confirmAction = async (title, message) => Boolean(await modal(title, `<p>${esc(message)}</p>`, {danger:true}));
