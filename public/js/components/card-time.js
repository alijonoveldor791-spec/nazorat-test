// Panel kartalari uchun Asia/Tashkent sanasi; to'liq sana tooltipda saqlanadi.
import { esc } from '../core/dom.js';
import { dateTime } from '../core/format.js';
const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];
export function cardTime(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return '—';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type).value;
  const text = `${Number(get('day'))}-${MONTHS[Number(get('month')) - 1]}, ${get('hour')}:${get('minute')}`;
  return `<time datetime="${esc(value)}" title="${esc(dateTime(value))}">${esc(text)}</time>`;
}
