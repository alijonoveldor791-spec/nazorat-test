// Unit testlar uchun yagona namuna manbasi.
import { readFileSync } from 'node:fs';
export const SAMPLE = readFileSync(new URL('../samples/namuna-test.txt', import.meta.url), 'utf8');
