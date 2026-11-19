// Sahifa qismlarining holati, hisoblangan qiymatlari va hayot davrini boshqaradi.
let active = null;
let enqueue = () => {};
let nextId = 0;
const instances = new Map();
const pending = [];

export function beginFrame(schedule) {
  enqueue = schedule;
  for (const item of instances.values()) item.used = false;
}

export function enterPart(key) {
  let item = instances.get(key);
  if (!item) {
    item = { slots: [], cursor: 0, used: true, alive: true };
    instances.set(key, item);
  }
  item.cursor = 0;
  item.used = true;
  active = item;
}

export function leavePart() {
  active = null;
}

function slot(create) {
  if (!active) throw new Error('Holat faqat sahifa qismi ichida ishlatiladi.');
  const index = active.cursor++;
  return active.slots[index] ?? (active.slots[index] = create(active));
}

export function state(initial) {
  const item = slot((owner) => {
    const value = { value: typeof initial === 'function' ? initial() : initial };
    value.set = (next) => {
      if (!owner.alive) return;
      const result = typeof next === 'function' ? next(value.value) : next;
      if (Object.is(result, value.value)) return;
      value.value = result;
      enqueue();
    };
    return value;
  });
  return [item.value, item.set];
}

const changed = (previous, next) =>
  !previous ||
  !next ||
  previous.length !== next.length ||
  next.some((value, index) => !Object.is(value, previous[index]));

export function memo(compute, dependencies) {
  const item = slot(() => ({ dependencies: undefined, value: undefined }));
  if (changed(item.dependencies, dependencies)) {
    item.value = compute();
    item.dependencies = dependencies;
  }
  return item.value;
}

export function callback(fn, dependencies) {
  return memo(() => fn, dependencies);
}
export function reference(initial) {
  return slot(() => ({ current: initial }));
}
export function uniqueId() {
  return slot(() => ({ value: `field-${++nextId}` })).value;
}

export function effect(run, dependencies) {
  const item = slot(() => ({ dependencies: undefined, cleanup: null }));
  if (changed(item.dependencies, dependencies)) {
    item.dependencies = dependencies;
    pending.push(() => {
      item.cleanup?.();
      item.cleanup = run();
    });
  }
}

export function commitFrame() {
  for (const [key, item] of instances) {
    if (item.used) continue;
    item.alive = false;
    for (const entry of item.slots) entry.cleanup?.();
    instances.delete(key);
  }
  const effects = pending.splice(0);
  for (const run of effects) run();
}

export function createScope(value) {
  const context = { value };
  context.Provider = ({ value: next, children }) => {
    context.value = next;
    return children;
  };
  return context;
}

export function readScope(context) {
  return context.value;
}
