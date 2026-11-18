// Qoidabuzarliklarni hodisa IDsi bilan saqlaydi va serverga ketma-ket, takrorsiz yuboradi.
import { api, ApiError } from '../core/api.js';
import { getBrowserKey } from '../core/attempt-storage.js';

export function violationSync({ read, update, receive, notify }) {
  let running = false,
    stopped = false,
    timer,
    warned = false,
    inFlight;
  async function push() {
    if (running || stopped || !read()?.violationQueue?.length) return;
    running = true;
    clearTimeout(timer);
    try {
      while (!stopped && read()?.violationQueue?.length) {
        const current = read();
        const event = current.violationQueue[0];
        const response = await api('attempts/violations', {
          method: 'POST',
          body: JSON.stringify({ attemptToken: current.attemptToken, browserKey: getBrowserKey(), ...event }),
        });
        if (stopped) return;
        const latest = read();
        if (!latest) return;
        update({
          ...latest,
          violationQueue: (latest.violationQueue || []).filter((item) => item.eventId !== event.eventId),
          violationCount: response.violationCount ?? latest.violationCount,
          screenshotCount: response.screenshotCount ?? latest.screenshotCount,
          violationLimit: response.violationLimit ?? latest.violationLimit,
          screenshotLimit: response.screenshotLimit ?? latest.screenshotLimit,
        });
        warned = false;
        if (response.result) {
          stopped = true;
          receive(response.result);
          return;
        }
        notify(
          `Ogohlantirish: ${response.violationCount}/${response.violationLimit} ta qoidabuzarlik.`,
          true
        );
      }
    } catch (error) {
      if (!stopped && !warned) {
        notify(
          error instanceof ApiError && [400, 401, 403].includes(error.status)
            ? "Himoya xabarini server tasdiqlamadi. Testga qaytib qayta urinib ko'ring."
            : 'Himoya xabari qurilmada saqlandi. Aloqa tiklanganda qayta yuboriladi.',
          true
        );
        warned = true;
      }
    } finally {
      running = false;
      if (!stopped && read()?.violationQueue?.length) timer = setTimeout(flush, 5000);
    }
  }
  function flush() {
    clearTimeout(timer);
    if (running) return inFlight;
    inFlight = push();
    return inFlight;
  }
  const online = () => {
    flush();
  };
  window.addEventListener('online', online);
  flush();
  return {
    report(type) {
      if (stopped || !read()) return;
      const current = read();
      const event = {
        eventId: crypto.randomUUID(),
        type,
        answers: [...current.answers],
        version: current.draftVersion || 0,
      };
      update({ ...current, violationQueue: [...(current.violationQueue || []), event] });
      flush();
    },
    flush,
    stop() {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('online', online);
    },
  };
}
