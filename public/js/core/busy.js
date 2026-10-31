// core/busy.js: sahifaning shu vazifasi uchun modul.
import {toast} from '../components/toast.js';
export function busy(button, task) {
  button.disabled = true;
  return Promise.resolve().then(task).catch(error => toast(error.message, true)).finally(() => { button.disabled = false; });
}
