// components/toast.js: sahifaning shu vazifasi uchun modul.
import {$} from '../core/dom.js';
export function toast(message, error = false) {
  let host = $('toasts');
  if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.className = 'toasts'; host.setAttribute('role', 'status'); document.body.append(host); }
  const node = document.createElement('div'); node.className = 'toast' + (error ? ' error' : ''); node.textContent = message; host.append(node);
  setTimeout(() => node.remove(), 5500);
}
