import type { AttemptState, StoredResult } from '../types/api';

export const DRAFT_KEY = 'nazorat-attempt-v2';
export const RESULT_KEY = 'nazorat-result-v2';
const BROWSER_KEY = 'nazorat-browser-key';

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadAttempt(): AttemptState | null {
  const data = readJson<AttemptState>(localStorage, DRAFT_KEY);
  if (!data || typeof data.attemptToken !== 'string' || !Array.isArray(data.questions)) return null;
  if (!Array.isArray(data.answers) || data.answers.length !== data.questions.length) {
    data.answers = Array(data.questions.length).fill(null);
  }
  if (!Array.isArray(data.flags)) data.flags = [];
  if (typeof data.current !== 'number' || data.current < 0 || data.current >= data.questions.length) {
    data.current = 0;
  }
  return data;
}

export function saveAttempt(state: AttemptState): boolean {
  return writeJson(localStorage, DRAFT_KEY, state);
}

export function discardAttempt(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadResult(): StoredResult | null {
  const fromLocal = readJson<StoredResult>(localStorage, RESULT_KEY);
  const fromSession = !fromLocal ? readJson<StoredResult>(sessionStorage, RESULT_KEY) : null;
  const value = fromLocal || fromSession;
  if (!value || !value.result || typeof value.attemptToken !== 'string') return null;
  return value;
}

export function finishAttempt(result: StoredResult['result'], state: AttemptState): void {
  try {
    localStorage.removeItem(RESULT_KEY);
  } catch {
    /* ignore */
  }
  const value: StoredResult = {
    result,
    title: state.title,
    identity: state.identity,
    attemptToken: state.attemptToken,
  };
  let saved = writeJson(localStorage, RESULT_KEY, value);
  if (!saved) saved = writeJson(sessionStorage, RESULT_KEY, value);
  if (!saved) {
    throw new Error("Serverda natija saqlandi, lekin qurilmaga joy yetmadi. Joy bo'shatib, qayta yuboring.");
  }
  discardAttempt();
}

export function clearStoredResult(): void {
  try {
    localStorage.removeItem(RESULT_KEY);
    sessionStorage.removeItem(RESULT_KEY);
  } catch {
    /* ignore */
  }
}

export function getBrowserKey(): string {
  let key: string | null = null;
  try {
    const raw = localStorage.getItem(BROWSER_KEY);
    key = raw ? JSON.parse(raw) : null;
  } catch {
    key = localStorage.getItem(BROWSER_KEY);
  }
  if (typeof key !== 'string' || !/^[a-f0-9-]{32,100}$/i.test(key)) {
    key = crypto.randomUUID();
    if (!writeJson(localStorage, BROWSER_KEY, key)) {
      throw new Error("Brauzerda saqlash o'chirilgan. Sozlamalarni tekshiring.");
    }
  }
  return key;
}

export async function ownAttemptLock(key: string): Promise<() => void> {
  if (navigator.locks) {
    let releaseLock: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    const acquired = await new Promise<boolean>((resolve) => {
      navigator.locks
        .request('nazorat-' + key, { ifAvailable: true }, async (lock) => {
          resolve(Boolean(lock));
          if (lock) await held;
        })
        .catch(() => resolve(false));
    });
    if (!acquired) throw new Error('OTHER_TAB');
    return releaseLock;
  }

  const leaseId = crypto.randomUUID();
  const leaseName = 'nazorat-lease-' + key;
  const existing = readJson<{ id: string; until: number }>(localStorage, leaseName);
  if (existing && existing.until > Date.now()) throw new Error('OTHER_TAB');
  const renew = () => writeJson(localStorage, leaseName, { id: leaseId, until: Date.now() + 6000 });
  renew();
  const interval = setInterval(renew, 2000);
  return () => {
    clearInterval(interval);
    const current = readJson<{ id: string }>(localStorage, leaseName);
    if (current?.id === leaseId) localStorage.removeItem(leaseName);
  };
}

export async function hasOpenAttempt(key: string): Promise<boolean> {
  if (navigator.locks) {
    const state = await navigator.locks.query();
    return Boolean(state.held?.some((lock) => lock.name === 'nazorat-' + key));
  }
  const current = readJson<{ until: number }>(localStorage, 'nazorat-lease-' + key);
  return Boolean(current && current.until > Date.now());
}
