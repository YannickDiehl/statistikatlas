import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAllbus } from './allbus';
import { fakeSav, fixtureSav } from './testData';

test('accepts ZA8831 and reports its version', () => {
  const check = validateAllbus(fixtureSav());
  assert.deepEqual(check, { ok: true, version: 'v1.3.0, 2025-07-30 (synthetisch)', nCases: 60 });
});

test('rejects other studies with the study number it found', () => {
  const check = validateAllbus(fakeSav({ za_nr: { values: [5270, 5270] } }));
  assert.equal(check.ok, false);
  assert.match(check.ok ? '' : check.message, /Studiennummer 5270/);
  const none = validateAllbus(fakeSav({ x: { values: [1] } }));
  assert.match(none.ok ? '' : none.message, /keine Studiennummer/);
});
