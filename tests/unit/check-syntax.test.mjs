// Sintaksis gate yaroqsiz modulni rad etishi va first-party doirasini tekshiradi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceFiles, inspectSource } from '../../scripts/check-syntax.mjs';

test('syntax gate accepts an ES module without executing it', () => {
  const result = inspectSource('export const value = 1; throw new Error("must not execute");');
  assert.equal(result.ok, true);
});

test('syntax gate rejects malformed JavaScript', () => {
  const result = inspectSource('export const = ;');
  assert.equal(result.ok, false);
  assert.match(result.error, /SyntaxError/);
});

test('syntax gate includes server, browser and tests without vendor or installed packages', () => {
  const files = sourceFiles().map((path) => path.replaceAll('\\', '/'));
  assert.ok(files.some((path) => path.endsWith('/server/router.mjs')));
  assert.ok(files.some((path) => path.endsWith('/public/js/student/test.js')));
  assert.ok(files.some((path) => path.endsWith('/tests/unit/check-syntax.test.mjs')));
  assert.ok(files.every((path) => !path.includes('/node_modules/') && !path.includes('/vendor/')));
});
