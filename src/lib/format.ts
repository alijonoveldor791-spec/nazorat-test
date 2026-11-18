import type { ResultRow } from '../types/api';

export function formatDateTime(value?: string | null): string {
  if (!value) return 'Belgilanmagan';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Belgilanmagan';
  return date.toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toTashkentInput(value?: string | null): string {
  if (!value) return '';
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms + 5 * 3600000).toISOString().slice(0, 16);
}

export function fromTashkentInput(value: string): string | null {
  if (!value) return null;
  const iso = value.length === 16 ? `${value}:00+05:00` : `${value}+05:00`;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

export function percent(row: Pick<ResultRow, 'score' | 'total' | 'dtmScore' | 'maxScore'>): number {
  if (!row.total) return 0;
  return Math.round((row.score / row.total) * 100);
}

export function formatScore(value: number | undefined | null): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

export function resultScore(
  row: Pick<ResultRow, 'score' | 'total' | 'dtmScore' | 'maxScore' | 'scoringMode'>
): string {
  if (row.scoringMode === 'dtm' || row.dtmScore !== undefined) {
    return `${formatScore(row.dtmScore ?? row.score)} / ${formatScore(row.maxScore ?? 189)} ball (${row.score}/${row.total})`;
  }
  return `${row.score} / ${row.total}`;
}

export function downloadBlob(filename: string, data: BlobPart, mime = 'text/plain;charset=utf-8'): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}
