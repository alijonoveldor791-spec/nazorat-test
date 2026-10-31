// Taymer ko’rinishi va muddat tugash hodisasi.
import { $ } from '../core/dom.js';
import { toast } from '../components/toast.js';
export function startTimer(deadline, onExpire) {
  let warned = false,
    interval;
  function tick() {
    if (!deadline) {
      $('timer').textContent = 'Vaqt cheklanmagan';
      return;
    }
    const left = Math.max(0, Math.ceil((Date.parse(deadline) - Date.now()) / 1000));
    $('timer').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    $('timer').classList.toggle('urgent', left <= 60);
    if (left <= 60 && !warned) {
      warned = true;
      toast('Bir daqiqadan kam vaqt qoldi.', true);
    }
    if (!left) {
      clearInterval(interval);
      onExpire();
    }
  }
  interval = setInterval(tick, 1000);
  tick();
  return () => clearInterval(interval);
}
