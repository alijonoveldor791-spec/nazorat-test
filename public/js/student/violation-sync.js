// Qoidabuzarlik navbati refreshdan keyin ham saqlanadi; hisobni faqat server beradi.
import { api } from '../core/api-client.js';
import { browserKey, saveAttempt } from './test-state.js';
import { toast } from '../components/toast.js';
export function violationSync(state, receive) {
  let running = false,
    stopped = false,
    timer;
  state.violationQueue ||= [];
  async function push() {
    if (running || stopped || !state.violationQueue.length) return;
    running = true;
    try {
      while (!stopped && state.violationQueue.length) {
        const event = state.violationQueue[0];
        const response = await api('attempts/violations', {
          method: 'POST',
          body: JSON.stringify({
            attemptToken: state.attemptToken,
            browserKey: browserKey(),
            ...event,
          }),
        });
        state.violationQueue.shift();
        state.violationCount = response.violationCount ?? state.violationCount;
        saveAttempt(state);
        if (response.result) {
          stopped = true;
          receive(response.result);
          return;
        }
        toast(`Ogohlantirish: ${response.violationCount}/${response.violationLimit} ta qoidabuzarlik.`, true);
      }
    } catch {
      toast('Qoidabuzarlik xabari yuborilmadi. Aloqa tiklanganda qayta yuboriladi.', true);
    } finally {
      running = false;
      if (!stopped && state.violationQueue.length) timer = setTimeout(push, 5000);
    }
  }
  const online = () => {
    clearTimeout(timer);
    push();
  };
  window.addEventListener('online', online);
  push();
  return {
    report(type) {
      if (stopped) return;
      state.violationQueue.push({
        eventId: crypto.randomUUID(),
        type,
        answers: [...state.answers],
        version: state.draftVersion || 0,
      });
      saveAttempt(state);
      push();
    },
    stop() {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('online', online);
    },
  };
}
