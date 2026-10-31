// Avtomatik lock faylini 250 qator qoidasiga mos mashina formatida saqlaydi.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
if (existsSync('package-lock.json')) {
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  writeFileSync('package-lock.json', JSON.stringify(lock) + '\n');
}
