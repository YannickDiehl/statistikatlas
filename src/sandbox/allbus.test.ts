import test from 'node:test';
import assert from 'node:assert/strict';
import { customItem, missingVariables, resolveItem, searchVariables, validateAllbus } from './allbus';
import { jugend, nichtwahl } from './claims';
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

test('lists variables a claim needs but the file lacks', () => {
  assert.deepEqual(missingVariables(fixtureSav(), jugend), []);
  assert.deepEqual(missingVariables(fakeSav({ age: { values: [30] } }), jugend), ['pa02a', 'li07', 'wghtpew']);
});

test('turns labelled numeric variables with 2 to 11 valid categories into items', () => {
  const sav = fixtureSav();
  const pa02a = customItem(sav.byName.get('pa02a')!, 'outcome')!;
  assert.deepEqual(pa02a.categories.map(c => c.code), [1, 2, 3, 4, 5]);
  assert.equal(pa02a.categories[0].label, '1 sehr stark');
  assert.deepEqual([pa02a.yes, pa02a.no], ['ja', 'nein']);
  assert.equal(customItem(sav.byName.get('kommentar')!, 'outcome'), null);
  assert.equal(customItem(sav.byName.get('respid')!, 'outcome'), null);
  assert.equal(customItem(sav.byName.get('pe01')!, 'group')!.split, true);
});

test('searches names and labels and resolves claim items before custom ones', () => {
  const sav = fixtureSav();
  assert.deepEqual(searchVariables(sav, 'vertrauen', 'outcome').map(i => i.variable), ['pt03', 'pt12', 'pt15']);
  assert.deepEqual(searchVariables(sav, 'x', 'outcome'), []);
  assert.equal(resolveItem(jugend, sav, 'pa02a'), jugend.items[0]);
  assert.equal(resolveItem(nichtwahl, sav, 'pt03').yes, 'ausgewählt');
  assert.throws(() => resolveItem(jugend, sav, 'kommentar'), /nicht verwendbar/);
});
