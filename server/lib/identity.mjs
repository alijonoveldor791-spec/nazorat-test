// lib/identity.mjs: serverdagi shu qatlam vazifasi.
import { createHash } from 'node:crypto';
export const norm = (value) =>
  String(value ?? '')
    .trim()
    .replace(/['‘ʼ`]/g, '’')
    .replace(/\s+/g, ' ')
    .toLowerCase();
export const hash = (text) => createHash('sha256').update(text).digest('hex');
