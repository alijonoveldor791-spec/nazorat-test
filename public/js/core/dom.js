// Mahalliy sahifa shablonlarini DOM tugunlariga aylantirib, fokusni saqlab yangilaydi.
import { beginFrame, enterPart, leavePart, commitFrame } from './state.js';
import { setProperties, setFormValue, assignRef } from './properties.js';
import { canRender } from './lifecycle.js';

export const fragment = Symbol('fragment');
export function el(type, props, ...children) {
  return { type, props: props || {}, children };
}
const types = new WeakMap();
let nextType = 0;
const records = new WeakMap();

function expand(value, path) {
  if (value == null || typeof value === 'boolean') return [];
  if (Array.isArray(value))
    return value.flatMap((child, index) => expand(child, `${path}/${child?.props?.key ?? index}`));
  if (typeof value !== 'object') return [{ type: '#text', text: String(value), key: path }];
  const { type, props, children } = value;
  if (type === fragment) return expand(children, path + '/fragment');
  if (typeof type === 'function') {
    if (!types.has(type)) types.set(type, ++nextType);
    const key = `${path}/part-${types.get(type)}`;
    enterPart(key);
    let output;
    try {
      output = type({ ...props, children: children.length === 1 ? children[0] : children });
    } finally {
      leavePart();
    }
    return expand(output, key);
  }
  return [{ type, props, key: path, children: expand(children, path + '/children') }];
}

function dispose(node) {
  const record = records.get(node);
  if (record?.props?.ref) assignRef(record.props.ref, null);
  for (const child of node.childNodes) dispose(child);
}

function patch(parent, children, svg = false) {
  const previous = new Map([...parent.childNodes].map((node) => [records.get(node)?.key, node]));
  let cursor = parent.firstChild;
  for (const child of children) {
    let node = previous.get(child.key);
    previous.delete(child.key);
    if (node && records.get(node)?.type !== child.type) {
      dispose(node);
      if (cursor === node) cursor = node.nextSibling;
      node.remove();
      node = null;
    }
    if (!node) {
      node =
        child.type === '#text'
          ? document.createTextNode(child.text)
          : svg || child.type === 'svg'
            ? document.createElementNS('http://www.w3.org/2000/svg', child.type)
            : document.createElement(child.type);
    }
    if (node !== cursor) parent.insertBefore(node, cursor);
    cursor = node.nextSibling;
    const old = records.get(node);
    if (child.type === '#text') {
      if (node.nodeValue !== child.text) node.nodeValue = child.text;
    } else {
      setProperties(node, old?.props || {}, child.props);
      const html = child.props.dangerouslySetInnerHTML?.__html;
      if (html != null) {
        if (old?.props?.dangerouslySetInnerHTML?.__html !== html) node.innerHTML = html;
      } else {
        if (old?.props?.dangerouslySetInnerHTML) node.replaceChildren();
        patch(node, child.children, svg || child.type === 'svg');
      }
      setFormValue(node, child.props);
    }
    records.set(node, child);
  }
  for (const node of previous.values()) {
    dispose(node);
    node.remove();
  }
}

export function mount(host, page) {
  let queued = false;
  const schedule = () => {
    if (queued || !canRender()) return;
    queued = true;
    queueMicrotask(render);
  };
  const render = () => {
    queued = false;
    if (!canRender()) return;
    beginFrame(schedule);
    patch(host, expand(page, 'page'));
    commitFrame();
  };
  render();
}
